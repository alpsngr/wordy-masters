const letters = document.querySelectorAll('.scoreboard-letter');
const loadingDiv = document.querySelector('.info-bar');
const ANSWER_LENGTH = 5;
const ROUNDS = 6;



async function init() {
    let currentGuess = '';
    let currentRow = '';
    let isLoading = true;

    const res = await fetch("https://words.dev-apis.com/word-of-the-day");
    const resObj = await res.json ();
    const word = resObj.word.toUpperCase();
    const wordParts = word.split("");
    let done = false;
    setLoading(false);
    isLoading = false;

  
    function addLetter(letter) {
        if (currentGuess.length < ANSWER_LENGTH) {
            currentGuess += letter;   //add letter to the end
        } 
        else {
            currentGuess = currentGuess.substring (0, currentGuess.length-1) + letter;   //replace the last letter
        }
        letters[ANSWER_LENGTH*currentRow + currentGuess.length-1].innerText = letter;
    }

    async function commit() {
        if (currentGuess.length !== ANSWER_LENGTH) {
            return;   // do nothing
        } 

        isLoading = true;
        setLoading (isLoading);
        const res = await fetch("https://words.dev-apis.com/validate-word", {
            method: "POST",
            body: JSON.stringify({word: currentGuess })
        });

        const resObj = await res.json();
        const validWord = resObj.validWord;
        //const {validWord} = resObj;

        isLoading = false;
        setLoading(isLoading);

        if (!validWord) {
            markInvalidWord ();
            return;
        }

        const guessParts = currentGuess.split("");
        const map = makeMap(wordParts);

        for (let i=0; i<ANSWER_LENGTH; i++) {
            //mark as correct
            if (guessParts[i] === wordParts [i]) {
            letters[ANSWER_LENGTH*currentRow + i].classList.add('correct');
            map[guessParts[i]]--;
            }
        }

        for (let i=0; i<ANSWER_LENGTH; i++) {
            if (guessParts[i] === wordParts [i]) {
                //do nothing we already did this.
            }
            else if (wordParts.includes(guessParts[i]) && map[guessParts[i]]>0) {
                 //mark as close
                letters[ANSWER_LENGTH*currentRow + i].classList.add('close');
                map[guessParts[i]]--;
            }
            else {
                letters[ANSWER_LENGTH*currentRow + i].classList.add('wrong');
            }

        }

        currentRow++;

        if (currentGuess === word) {
            // Harflerin yeşil olarak işaretlenmesini bekleyin ve ardından kazandınız mesajını gösterin
            setTimeout(() => {
                alert('You Win!');
                document.querySelector('.brand').classList.add('winner');
            }, 10); // 10 milisaniyelik bir gecikme
            done = true;
            return;
        }
        
        else if (currentRow == ROUNDS) {
            alert(`You lose, the world was ${word}`);
        }
        currentGuess = '';
        }
    



    function backspace () {
        currentGuess = currentGuess.substring (0, currentGuess.length-1);
        letters[ANSWER_LENGTH*currentRow + currentGuess.length].innerText = '';
        }
    
    function markInvalidWord() {
        //alert ('not a valid word');

        for (let i=0; i<ANSWER_LENGTH; i++) {
            letters[ANSWER_LENGTH*currentRow + i].classList.remove('invalid');
            setTimeout (function () {
                letters[ANSWER_LENGTH*currentRow + i].classList.add('invalid'); 
            }, 10);
        }
    }

    document.addEventListener('keydown', function handleKeyPress (event) {  //function name is optinal. if to see error for which function.
        if (done || isLoading) {
            //do nothing
            return;
        }
        const action = event.key;
   
        if (action === 'Enter') {
            commit();
        } 
        else if (action === 'Backspace') {
            backspace();
        }
        else if(isLetter(action)) {
            addLetter(action.toUpperCase());
        }
        else {
          //do nothing  
        }
        });
}



function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
  }
    
function setLoading (isLoading) {
    loadingDiv.classList.toggle('hidden', !isLoading);
}

function makeMap (array) {
    const obj = {};
    for (let i=0; i<array.length; i++) {
        const letter = array[i];
        if (obj[letter]) {
            obj[letter]++;
        }
        else {
            obj[letter] = 1;
        }
    }
    return obj;
}

init();