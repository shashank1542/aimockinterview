"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useContext, useEffect, useState, useRef } from "react";
import Webcam from "react-webcam";
import { Mic } from "lucide-react";
import { toast } from "sonner";
import { getCohereFeedback } from "@/utils/CohereAIModal";
import { chatSession } from "@/utils/GeminiAIModal";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { WebCamContext } from "@/app/dashboard/layout";
import { GoogleGenerativeAI } from "@google/generative-ai";

const RecordAnswerSection = ({
  mockInterviewQuestion,
  activeQuestionIndex,
  interviewData,
}) => {
  const [userAnswer, setUserAnswer] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { webCamEnabled, setWebCamEnabled } = useContext(WebCamContext);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

  useEffect(() => {
    if (!isRecording && userAnswer.length > 10) {
      updateUserAnswer();
    }
  }, [userAnswer]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await transcribeAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast(
        "Error starting recording. Please check your microphone permissions."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob) => {
    try {
      setLoading(true);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Convert audio blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result.split(",")[1];

        const result = await model.generateContent([
          "Transcribe the following audio:",
          { inlineData: { data: base64Audio, mimeType: "audio/webm" } },
        ]);

        const transcription = result.response.text();
        setUserAnswer((prevAnswer) => prevAnswer + " " + transcription);
        setLoading(false);
      };
    } catch (error) {
      console.error("Error transcribing audio:", error);
      toast("Error transcribing audio. Please try again.");
      setLoading(false);
    }
  };

  const fetchAIResponses = async (userAnswer, question) => {
    try {
      console.log("Fetching AI feedback...");

      const geminiFeedbackResp = await chatSession.sendMessage(
        `Provide rating (1-10) and feedback in JSON format.
         Question: ${question}
         User Answer: ${userAnswer}`
      );

      const cohereFeedbackResp = await getCohereFeedback(userAnswer, question); // Fix variable name

      console.log("Gemini Feedback:", geminiFeedbackResp);
      console.log("Cohere Feedback:", cohereFeedbackResp);

      return { geminiFeedbackResp, cohereFeedbackResp }; // Ensure both responses are returned
    } catch (error) {
      console.error("Error fetching AI feedback:", error);
      return { geminiFeedbackResp: null, cohereFeedbackResp: null };
    }
  };

  const updateUserAnswer = async () => {
    try {
      setLoading(true);

      const feedbackPrompt = `Question: ${mockInterviewQuestion[activeQuestionIndex]?.Question}
         User Answer: ${userAnswer}
         Provide a rating (1-10) and feedback for improvement in JSON format with 'rating' and 'feedback' fields.`;

      // Fetch AI feedback from both Gemini & Cohere
      const geminiResponse = await chatSession.sendMessage(feedbackPrompt);
      const cohereFeedbackResp = await getCohereFeedback(
        userAnswer,
        mockInterviewQuestion[activeQuestionIndex]?.Question
      );
      console.log("Cohere Feedback:", cohereFeedbackResp); // Debugging log

      // Extract Gemini feedback
      let MockJsonResp = await geminiResponse.response.text();

      // Ensure we extract valid JSON by finding where it starts
      const jsonStartIndex = MockJsonResp.indexOf("{");
      if (jsonStartIndex !== -1) {
        MockJsonResp = MockJsonResp.substring(jsonStartIndex).trim();
      }

      // Clean unwanted markdown formatting
      MockJsonResp = MockJsonResp.replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      console.log("Cleaned Gemini Response:", MockJsonResp); // Debugging

      let geminiFeedbackResp;
      try {
        geminiFeedbackResp = JSON.parse(MockJsonResp);
      } catch (error) {
        console.error("Error parsing Gemini feedback:", error);
        geminiFeedbackResp = { rating: "N/A", feedback: MockJsonResp };
      }

      // ✅ Declare fallback values for Cohere AI before saving
      const safeCohereFeedback =
        cohereFeedbackResp?.feedback || "Cohere AI feedback unavailable";
      const safeCohereRating = cohereFeedbackResp?.rating || "N/A";

      // Store both AI responses in the database
      const resp = await db.insert(UserAnswer).values({
        mockIdRef: interviewData?.mockId,
        question: mockInterviewQuestion[activeQuestionIndex]?.Question,
        correctAns: mockInterviewQuestion[activeQuestionIndex]?.Answer,
        userAns: userAnswer,
        feedback: JSON.stringify({
          gemini: geminiFeedbackResp.feedback,
          cohere: safeCohereFeedback,
        }),
        rating: JSON.stringify({
          gemini: geminiFeedbackResp.rating,
          cohere: safeCohereRating,
        }),
        userEmail: user?.primaryEmailAddress?.emailAddress,
        createdAt: moment().format("YYYY-MM-DD"),
      });

      if (resp) {
        toast("User Answer recorded successfully with dual AI feedback!");
      }
      setUserAnswer("");
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast("An error occurred while recording the user answer");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center overflow-hidden">
      <div className="flex flex-col justify-center items-center rounded-lg p-5 bg-black mt-4 w-[30rem] ">
        {webCamEnabled ? (
          <Webcam
            mirrored={true}
            style={{ height: 250, width: "100%", zIndex: 10 }}
          />
        ) : (
          <Image
            src={"/camera.jpg"}
            width={200}
            height={200}
            alt="Camera placeholder"
          />
        )}
      </div>
      <div className="md:flex mt-4 md:mt-8 md:gap-5">
        <div className="my-4 md:my-0">
          <Button onClick={() => setWebCamEnabled((prev) => !prev)}>
            {webCamEnabled ? "Close WebCam" : "Enable WebCam"}
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={loading}
        >
          {isRecording ? (
            <h2 className="text-red-400 flex gap-2 ">
              <Mic /> Stop Recording...
            </h2>
          ) : (
            " Record Answer"
          )}
        </Button>
      </div>
      {/* Check transcription code */}
      {/* {userAnswer && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-bold">Transcribed Answer:</h3>
          <p>{userAnswer}</p>
        </div>
      )} */}
    </div>
  );
};

export default RecordAnswerSection;

// "use client";
// import { Button } from "@/components/ui/button";
// import Image from "next/image";
// import React, { useContext, useEffect, useState } from "react";
// import Webcam from "react-webcam";
// import useSpeechToText from "react-hook-speech-to-text";
// import { Mic } from "lucide-react";
// import { toast } from "sonner";
// import { chatSession } from "@/utils/GeminiAIModal";
// import { db } from "@/utils/db";
// import { UserAnswer } from "@/utils/schema";
// import { useUser } from "@clerk/nextjs";
// import moment from "moment";
// import { WebCamContext } from "@/app/dashboard/layout";

// const RecordAnswerSection = ({
//   mockInterviewQuestion,
//   activeQuestionIndex,
//   interviewData,
// }) => {
//   const [userAnswer, setUserAnswer] = useState("");
//   const { user } = useUser();
//   const [loading, setLoading] = useState(false);
//   const {
//     error,
//     interimResult,
//     isRecording,
//     results,
//     startSpeechToText,
//     stopSpeechToText,
//     setResults,
//   } = useSpeechToText({
//     continuous: true,
//     useLegacyResults: false,
//   });
//   const { webCamEnabled, setWebCamEnabled } = useContext(WebCamContext);

//   useEffect(() => {
//     results.map((result) =>
//       setUserAnswer((prevAns) => prevAns + result?.transcript)
//     );
//   }, [results]);

//   useEffect(() => {
//     if (!isRecording && userAnswer.length > 10) {
//       updateUserAnswer();
//     }
//     // if (userAnswer?.length < 10) {
//     //   setLoading(false);
//     //   toast("Error while saving your answer, Please record again");
//     //   return;
//     // }
//   }, [userAnswer]);

//   const StartStopRecording = async () => {
//     if (isRecording) {
//       stopSpeechToText();
//     } else {
//       startSpeechToText();
//     }
//   };

//   const updateUserAnswer = async () => {
//     try {
//       console.log(userAnswer);
//       setLoading(true);
//       const feedbackPrompt =
//         "Question:" +
//         mockInterviewQuestion[activeQuestionIndex]?.Question +
//         ", User Answer:" +
//         userAnswer +
//         " , Depends on question and user answer for given interview question" +
//         " please give us rating for answer and feedback as area of improvement if any " +
//         "in just 3 to 5 lines to improve it in JSON format with rating field and feedback field";

//       const result = await chatSession.sendMessage(feedbackPrompt);

//       let MockJsonResp = result.response.text();
//       console.log(MockJsonResp);

//       // Removing possible extra text around JSON
//       MockJsonResp = MockJsonResp.replace("```json", "").replace("```", "");

//       // Attempt to parse JSON
//       let jsonFeedbackResp;
//       try {
//         jsonFeedbackResp = JSON.parse(MockJsonResp);
//       } catch (e) {
//         throw new Error("Invalid JSON response: " + MockJsonResp);
//       }

//       const resp = await db.insert(UserAnswer).values({
//         mockIdRef: interviewData?.mockId,
//         question: mockInterviewQuestion[activeQuestionIndex]?.Question,
//         correctAns: mockInterviewQuestion[activeQuestionIndex]?.Answer,
//         userAns: userAnswer,
//         feedback: jsonFeedbackResp?.feedback,
//         rating: jsonFeedbackResp?.rating,
//         userEmail: user?.primaryEmailAddress?.emailAddress,
//         createdAt: moment().format("YYYY-MM-DD"),
//       });

//       if (resp) {
//         toast("User Answer recorded successfully");
//       }
//       setUserAnswer("");
//       setResults([]);
//       setLoading(false);
//     } catch (error) {
//       console.error(error);
//       toast("An error occurred while recording the user answer");
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center overflow-hidden">
//       <div className="flex flex-col justify-center items-center rounded-lg p-5 bg-black mt-4 w-[30rem] ">
//         {webCamEnabled ? (
//           <Webcam
//             mirrored={true}
//             style={{ height: 250, width: "100%", zIndex: 10 }}
//           />
//         ) : (
//           <Image src={"/camera.jpg"} width={200} height={200} />
//         )}
//       </div>
//       <div className="md:flex  mt-4 md:mt-8 md:gap-5">
//         <div className="my-4 md:my-0">
//           <Button
//             // className={`${webCamEnabled ? "w-full" : "w-full"}`}
//             onClick={() => setWebCamEnabled((prev) => !prev)}
//           >
//             {webCamEnabled ? "Close WebCam" : "Enable WebCam"}
//           </Button>
//         </div>
//         <Button
//           varient="outline"
//           // className="my-10"
//           onClick={StartStopRecording}
//           disabled={loading}
//         >
//           {isRecording ? (
//             <h2 className="text-red-400 flex gap-2 ">
//               <Mic /> Stop Recording...
//             </h2>
//           ) : (
//             " Record Answer"
//           )}
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default RecordAnswerSection;
