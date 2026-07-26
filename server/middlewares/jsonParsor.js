/**
 * Sanitizes and safely parses JSON strings returned by LLMs.
 * Removes markdown code blocks, backticks, and trailing/leading noise.
 * 
 * @param {string} rawString - The raw output text from the LLM
 * @returns {Object|null} The parsed JSON object, or null if parsing fails completely
 */
export const safeParseLLMJson = (rawString) => {
    if (!rawString || typeof rawString !== 'string') return null;

    // Clean up leading/trailing whitespace
    let cleanString = rawString.trim();

    // Remove markdown blocks if present (e.g., ```json ... ``` or ``` ...)
    if (cleanString.startsWith("```")) {
        // Strip out the opening backticks and an optional 'json' identifier
        cleanString = cleanString.replace(/^```(?:json)?\n?/i, "");
        // Strip out the closing backticks
        cleanString = cleanString.replace(/```$/, "");
        cleanString = cleanString.trim();
    }

    try {
        return JSON.parse(cleanString);
    } catch (error) {
        console.error("Failed to parse LLM JSON aftersanitization:", error);
        
        // Fallback: If there's still stray conversational text before '{' or after '}'
        try {
            const startIdx = cleanString.indexOf('{');
            const endIdx = cleanString.lastIndexOf('}');
            
            if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
                const extractedJson = cleanString.substring(startIdx, endIdx + 1);
                return JSON.parse(extractedJson);
            }
        } catch (nestedError) {
            console.error("Deep extraction parsing also failed:", nestedError);
        }
        
        return null;
    }
};