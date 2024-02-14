function Task(text, numWords, activeWordCount, activeIndex, hasError, accuracy) {
	this.text = text;
	this.numWords = numWords;
	this.activeWordCount = activeWordCount;
	this.activeIndex = activeIndex;
	this.hasError = hasError;
	this.accuracy = accuracy
	this.correctChars = 0;
	this.incorrectChars = 0;
	this.finished = false;
}

function numWordsInString(str) {
	return str.split(' ').length;
}

function createTask(str) {
	return new Task(str, numWordsInString(str), 0, 0, false, 100);
}

function resetTaskState() {
	sample_text.className = "";
	// reset task
	currentTask.activeIndex = 0;
	currentTask.activeWordCount = 0;
	currentTask.hasError = false;
	currentTask.finished = false;
	// currentTask = createTask(generate({exactly: 24, join: ' '}));

	// reset elements
	sample_text.innerHTML = strToHTML(default_content, 0, 0);
	input_text.value = ""

	percentage_text.innerText = "0%";
	wpm_text.innerText = "0";
	num_words_text.innerText = "0";
	accuracy_text.innerText = "0.00%";
}

let default_content = 'Crazy? I was crazy once. They locked me in a room. A rubber room! A rubber room with rats, and rats make me crazy.';
let content = default_content;

let currentTask = createTask(default_content);

let start_time = 0;
let end_time = 0;

let sample_text = document.getElementById("sample");
let input_text = document.getElementById("input");
let wpm_text = document.getElementById("wpm");
let num_words_text = document.getElementById("numwords");
let percentage_text = document.getElementById("percentage");
let accuracy_text = document.getElementById("accuracy");
let export_btn = document.getElementById("export");
let reset_btn = document.getElementById("reset");

function strToHTML(str, correct_end, error_end) {
	let result = '<span class="blue">' +
			str.substring(0, correct_end) + 
			'</span><span class="red">' + 
			str.substring(correct_end, error_end) + 
			'</span>';
	if (error_end > correct_end) {
		result += str.substring(error_end, str.length)
	} else {
		result += '<span class="selected">' + str.substring(correct_end, correct_end+1) + '</span>'
		result += str.substring(error_end+1, str.length);
	}
	return result;
}           


function updateSampleHighlight(event) {
	if (event != -1 && !currentTask.hasError) {
		console.log("valid input");
		input_text.value += event.key;
	
		let currentCharText = currentTask.text[currentTask.activeIndex];
		let input = event.key;

		// console.log("Comparing: " + currentCharText + " to input: " + input);
		if (currentCharText === input) {
			currentTask.hasError = false;
			currentTask.activeIndex++;

			// incriment word count for wpm
			if (currentCharText === ' ') {
				currentTask.activeWordCount++;
			}

			// add correct char
			currentTask.correctChars++;
		} else {
			currentTask.hasError = true;

			// add incorrect char
			currentTask.incorrectChars++;
		}
	}
	
	// get time
	if (input_text.value.length == 1) {
		start_time = new Date().getTime();
	}

	if (currentTask.activeIndex == currentTask.text.length) {
		
		sample_text.innerHTML = default_content;
		sample_text.classList.add("green");
		currentTask.finished = true;
		currentTask.activeWordCount++;

	} else {
		sample_text.innerHTML = strToHTML(currentTask.text, currentTask.activeIndex, input_text.value.length);
	}

	// get end time
	end_time = new Date().getTime();
	var timeInSeconds = (end_time - start_time) / 1000;
	var wordsPerMinute = (currentTask.activeWordCount / (timeInSeconds > 0 ? timeInSeconds : 0.000001)) * 60;

	// set wpm text
	wpm_text.innerText = wordsPerMinute.toFixed(2).toString();
	// set num words text
	num_words_text.innerText = currentTask.activeWordCount;
	

	let result = (currentTask.activeIndex / sample_text.innerText.length)*100;

	// Round the result to two decimal places
	let roundedResult = result.toFixed(2);

	// Convert the rounded result to a string
	let roundedResultString = roundedResult.toString();

	percentage_text.innerText = roundedResultString + "%";

	let accuracy = 100.00;
	if (currentTask.incorrectChars || currentTask.correctChars) {
		accuracy = (currentTask.correctChars)/(currentTask.correctChars + currentTask.incorrectChars) * 100;
	}

	accuracy_text.innerText = accuracy.toFixed(2).toString() + "%";
}

document.addEventListener("keypress", (event) => {
	if (!currentTask.finished) {
		updateSampleHighlight(event);
	} else {
		if (event.key === 'r') {
			resetTaskState();
		}
	}
});
document.addEventListener("keydown", (event) => {
	if (event.key == 'Backspace') {
		if (currentTask.hasError) {
			// reset error state
			currentTask.hasError = false;
			// remove last char in input field
			input_text.value = input_text.value.slice(0, -1);

			// decrement word count
			if (currentTask.text[currentTask.activeIndex] === ' ') {
				currentTask.activeWordCount--;
			}
		}
		
		updateSampleHighlight(-1);
	}
})

reset_btn.addEventListener("click", () => {
	reset_btn.blur();

	resetTaskState();
});

export_btn.addEventListener("click", () => {
	if (currentTask.finished) {
		let textContent = `WPM: ${wpm_text.innerText}\nAccuracy: ${accuracy_text.innerText}`;

		let blob = new Blob([textContent], {type: 'text/plain'});

		// Create a link element
		let a = document.createElement('a');

		// Set the URL of the link to the blob
		a.href = URL.createObjectURL(blob);

		// Set the filename for the downloaded file
		a.download = 'results.txt';

		// Simulate a click on the link to trigger the download
		a.click();
	}
});