"use client";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

const Feedback = ({ params }) => {
  const router = useRouter();
  const [feedbackList, setFeedbackList] = useState([]);

  useEffect(() => {
    GetFeedback();
  }, []);

  const GetFeedback = async () => {
    const result = await db
      .select()
      .from(UserAnswer)
      .where(eq(UserAnswer.mockIdRef, params.interviewId))
      .orderBy(UserAnswer.id);

    console.log(result);

    // Ensure feedback is correctly parsed as JSON (handling Gemini + Cohere AI feedback)
    const updatedFeedbackList = result.map((item) => {
      let parsedFeedback = {
        gemini: "No feedback available",
        cohere: "No feedback available",
      };
      let parsedRating = { gemini: "N/A", cohere: "N/A" };

      try {
        // Ensure both feedbacks are safely extracted
        if (item.feedback) {
          let cleanedFeedback = item.feedback
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
          parsedFeedback = JSON.parse(cleanedFeedback);
        }

        if (item.rating) {
          let cleanedRating = item.rating
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
          parsedRating = JSON.parse(cleanedRating);
        }
      } catch (error) {
        console.error("Error parsing feedback JSON:", error, item.feedback);
      }

      return { ...item, parsedFeedback, parsedRating };
    });

    setFeedbackList(updatedFeedbackList);
  };

  const overallRating = useMemo(() => {
    if (feedbackList.length > 0) {
      const totalGeminiRating = feedbackList.reduce(
        (sum, item) => sum + Number(item.parsedRating?.gemini || 0),
        0
      );
      const totalCohereRating = feedbackList.reduce(
        (sum, item) => sum + Number(item.parsedRating?.cohere || 0),
        0
      );

      const avgGemini = (totalGeminiRating / feedbackList.length).toFixed(1);
      const avgCohere = (totalCohereRating / feedbackList.length).toFixed(1);

      return { gemini: avgGemini, cohere: avgCohere };
    }
    return { gemini: 0, cohere: 0 };
  }, [feedbackList]);

  return (
    <div className="p-10">
      {feedbackList?.length == 0 ? (
        <h2 className="font-bold text-xl text-gray-500 my-5">
          No Interview feedback Record Found
        </h2>
      ) : (
        <>
          <h2 className="text-3xl font-bold text-green-500">Congratulations</h2>
          <h2 className="font-bold text-2xl">
            Here is your interview feedback
          </h2>

          {/* Dual AI Overall Rating */}
          <h2 className="text-primary text-lg my-3">
            Your overall interview rating{" "}
            <strong
              className={`${
                overallRating.gemini >= 5 ? "text-green-500" : "text-red-600"
              }`}
            >
              Gemini AI: {overallRating.gemini}/10
            </strong>{" "}
            <strong
              className={`${
                overallRating.cohere >= 5 ? "text-green-500" : "text-red-600"
              }`}
            >
              Cohere AI: {overallRating.cohere}/10
            </strong>
          </h2>

          <h2 className="text-sm text-gray-500">
            Find below interview question with correct answer, Your answer, and
            feedback for improvement
          </h2>

          {feedbackList &&
            feedbackList.map((item, index) => (
              <Collapsible key={index} className="mt-7">
                <CollapsibleTrigger className="p-2 bg-secondary rounded-lg my-2 text-left flex justify-between gap-7 w-full">
                  {item.question} <ChevronDown className="h-5 w-5" />{" "}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="flex flex-col gap-2">
                    {/* Display Dual AI Ratings */}
                    <h2 className="text-red-500 p-2 border rounded-lg">
                      <strong>Gemini Rating: </strong>
                      {item.parsedRating?.gemini || "N/A"}
                    </h2>
                    <h2 className="text-yellow-500 p-2 border rounded-lg">
                      <strong>Cohere Rating: </strong>
                      {item.parsedRating?.cohere || "N/A"}
                    </h2>

                    <h2 className="p-2 border rounded-lg bg-red-50 text-sm text-red-900">
                      <strong>Your Answer: </strong>
                      {item.userAns}
                    </h2>
                    <h2 className="p-2 border rounded-lg bg-green-50 text-sm text-green-900">
                      <strong>Correct Answer: </strong>
                      {item.correctAns}
                    </h2>

                    {/* Display Dual AI Feedback Side-by-Side */}
                    <h2 className="p-2 border rounded-lg bg-blue-50 text-sm text-primary-900">
                      <strong>Google Gemini Feedback: </strong>
                      {item.parsedFeedback?.gemini || "No feedback available"}
                    </h2>

                    <h2 className="p-2 border rounded-lg bg-yellow-50 text-sm text-yellow-900">
                      <strong>Cohere AI Feedback: </strong>
                      {item.parsedFeedback?.cohere || "No feedback available"}
                    </h2>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
        </>
      )}

      <Button onClick={() => router.replace("/dashboard")}>Go Home</Button>
    </div>
  );
};

export default Feedback;
