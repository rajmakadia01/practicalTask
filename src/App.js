import React, { useState, useEffect } from 'react';

const App = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('https://opentdb.com/api.php?amount=10&type=multiple');
        if (response.ok) {
          const data = await response.json();
          setQuestions(data.results);
        } else if (response.status === 429 && retryCount < 3) {
          // Retry with an increasing delay (e.g., 1s, 2s, 4s)
          setTimeout(() => {
            setRetryCount((prevRetryCount) => prevRetryCount + 1);
            fetchQuestions();
          }, Math.pow(2, retryCount) * 10000);
        } else {
          console.error(`HTTP error! Status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestions();
  }, [retryCount]);

  const handleOptionSelect = (selectedOption) => {
    setUserAnswer(selectedOption);
  };

  const handleNextQuestion = () => {
    const isCorrect = userAnswer === questions[currentQuestionIndex].correct_answer;
    if (!userAnswer) {
      alert('Please select an option before submitting...');
      return;
    }

    if (isCorrect) {
      setCorrectAnswers((prevCorrect) => prevCorrect + 1);
    } else {
      setIncorrectAnswers((prevIncorrect) => prevIncorrect + 1);
    }

    setShowResult(true);
  };

  const handleNextButtonClick = () => {
    setShowResult(false);
    setUserAnswer(null);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      // Redirect to the result page or perform any necessary action
      console.log('Quiz Completed. Redirect to Result Page.');
    }
  };

  if (questions.length === 0) {
    return (

    <div className="spinner-container">
    <div className="spinner"></div>
  </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className='quiz-container'>
      <h2>Question {currentQuestionIndex + 1}</h2>
      <p>{currentQuestion.question}</p>
      <ul>
        {currentQuestion.incorrect_answers.map((option, index) => (
          <li key={index}>
            <label>
              <input
                type="radio"
                name="options"
                value={option}
                onChange={() => handleOptionSelect(option)}
                checked={userAnswer === option}
              />
              {option}
            </label>
          </li>
        ))}
        <li>
          <label>
            <input
              type="radio"
              name="options"
              value={currentQuestion.correct_answer}
              onChange={() => handleOptionSelect(currentQuestion.correct_answer)}
              checked={userAnswer === currentQuestion.correct_answer}
            />
            {currentQuestion.correct_answer}
          </label>
        </li>
      </ul>
      {showResult && (
         <div>
           <div className='correct_ans'>
         <p>{userAnswer === currentQuestion.correct_answer ? 'Correct!' : 'Incorrect!'}</p>
         {userAnswer !== currentQuestion.correct_answer && (
           <div>
             <p >Correct Answer: {currentQuestion.correct_answer}</p>
             <p>Explanation: {currentQuestion.explanation}</p>
           </div>
           
         )}
         </div>
         <button onClick={handleNextButtonClick}>Next</button>
       </div>
      )}
      {!showResult && <button onClick={handleNextQuestion}>Submit</button>}

      {currentQuestionIndex === questions.length - 1 && (
        <div className='result-container'>
          <h2>Quiz Result</h2>
          <p>Total Questions Served: {questions.length}</p>
          <p>Total Correct: {correctAnswers}</p>
          <p>Total Incorrect: {incorrectAnswers}</p>
        </div>
      )}
    </div>
  );
};
export default App