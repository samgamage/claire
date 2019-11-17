
/**
 * Analyzes sentiment of a conversation. 
 * @param  {object} messages [description]
 * @return {[type]}          [description]
 */
const getSentiment = (messages) => {
  const URL = "https://us-central1-appathon-259223.cloudfunctions.net/convsersationAnalysis"; 
  return fetch(URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages
    })
  }).then((response) => {
    return response.json()
  });
};

export {
  getSentiment
};
