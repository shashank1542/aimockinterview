import axios from "axios";

const COHERE_API_KEY = process.env.NEXT_PUBLIC_COHERE_API_KEY;
const COHERE_API_URL = "https://api.cohere.ai/v1/generate"; // Correct endpoint

export const getCohereFeedback = async (userAnswer, question) => {
  try {
    // Debugging: Check if API key is loaded correctly
    console.log("Cohere API Key Loaded:", COHERE_API_KEY);

    // Throw an error if the API key is missing
    if (!COHERE_API_KEY) {
      throw new Error("Cohere API key is missing! Check your .env.local file.");
    }
    const response = await axios.post(
      COHERE_API_URL,
      {
        model: "command",
        prompt: `Provide structured feedback for this interview answer.
                 Question: ${question}
                 User's Answer: ${userAnswer}
                 Give a rating (1-10) and detailed feedback for improvement in JSON format.`,
        max_tokens: 300,
        temperature: 0.7,
        format: "json", // Ensures JSON response
      },
      {
        headers: {
          Authorization: `Bearer ${COHERE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Extract response text
    let rawText =
      response.data?.generations?.[0]?.text?.trim() ||
      "Error: No valid feedback received.";

    // Remove unnecessary text before JSON
    const jsonStartIndex = rawText.indexOf("{"); // Find where JSON starts
    if (jsonStartIndex !== -1) {
      rawText = rawText.substring(jsonStartIndex).trim(); // Extract only valid JSON
    }

    // Ensure JSON format by removing markdown safely
    rawText = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    console.log("Cleaned Cohere Response:", rawText); // Debugging

    // Safe JSON parsing
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(rawText);
      if (!parsedResponse.rating || !parsedResponse.feedback) {
        throw new Error("Invalid JSON structure from Cohere AI");
      }
    } catch (error) {
      console.error("Error parsing Cohere feedback:", error);
      parsedResponse = { rating: "N/A", feedback: `Raw response: ${rawText}` }; // Returns raw text for debugging
    }

    return parsedResponse;
  } catch (error) {
    console.error(
      "Error fetching Cohere AI feedback:",
      error.response?.data || error.message
    );
    return { rating: "N/A", feedback: "Error processing feedback." };
  }
};
