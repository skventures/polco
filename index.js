function areResponsesValid(questions, responses) {
  // Create a map of question IDs to questions
  const questionMap = new Map(questions.map(q => [q.id, q]));
  // Create a set of question IDs that should be displayed to the user
  const displayedQuestions = new Set(questions.map(q => q.id));

  for (const q of questions) {
    if (q.condition) {
      const conditionMet = evaluateCondition(q.condition, responses, questionMap);
      // If condition(s) are not met, remove question from list of "displayed" questions
      if (!conditionMet) {
        displayedQuestions.delete(q.id);
      }
    }
  }

  // Check that every displayed question has a corresponding response
  for (const qId of displayedQuestions) {
    const q = questionMap.get(qId);
    const response = responses.find(r => r.questionId === qId);

    if (!response) {
      return false;
    }

    if (!q.choices.includes(response.choice)) {
      return false;
    }
  }

  // Check that there is no response for a question that should not be displayed
  for (const response of responses) {
    if (!displayedQuestions.has(response.questionId)) {
      return false;
    }
  }

  return true;
}

function evaluateCondition(condition, responses, questionMap) {
  switch (condition.type) {
    case "AND":
      // AND requires every subcondition to be met so use every()
      return condition.subconditions.every(subcondition =>
        evaluateCondition(subcondition, responses, questionMap)
      );
    case "OR":
      // OR requires a minimum of one to be met so use some()
      return condition.subconditions.some(subcondition =>
        evaluateCondition(subcondition, responses, questionMap)
      );
    default:
      const response = responses.find(r => r.questionId === condition.questionId);

      if (!response) {
        return false;
      }

      return condition.choice == response.choice;
  }
}