import React from 'react';

const ResetButton = () => {
  const handleReset = () => {
    localStorage.removeItem('savedJokes');
    window.location.reload();
  };

  return (
    <button onClick={handleReset}>Reset Votes</button>
  );
};

export default ResetButton;
