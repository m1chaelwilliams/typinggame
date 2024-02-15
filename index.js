let copypastas = [
	"Crazy? I was crazy once. They locked me in a room. A rubber room! A rubber room with rats, and rats make me crazy.",
	"I'm Rick Harrison, and this is my pawn shop. I work here with my old man and my son, Big Hoss. Everything in here has a story and a price. One thing I've learned after 69 years - you never know what is gonna come through that door.",
]

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

function getNewTaskStr() {
	if (randomize) {
		let result = "";

		for (let i = 0; i < 25; i++) {
			let outer_index = Math.floor(Math.random() * copypastas.length);

			let inner_index = Math.floor(Math.random() * numWordsInString(copypastas[outer_index]));

			var sanitizedString = copypastas[outer_index].replace(/[.,!_\-\+=$?\[\]()]/g, '').toLowerCase();

			// Split the string by one or more spaces and filter out empty strings
			var wordsArray = sanitizedString.split(/\s+/).filter(word => word !== '');

			// Return the randomly chosen word
			result += wordsArray[inner_index] + " ";

			// result += copypastas[outer_index].replace(/[.,!_\-\+=$?\[\]()]/g, '').toLowerCase().split(' ')[inner_index] + " ";
		}

		return result.slice(0, -1); // remove extra ' ' at end
	} else {
		let index = Math.floor(Math.random() * copypastas.length);
		while (index === currentTaskID) {
			index = Math.floor(Math.random() * copypastas.length);
		}
		currentTaskID = index;

		return copypastas[index];
	}
}

function resetTaskState() {
	if (sample_text.classList.contains("green")) {
		sample_text.classList.remove("green");
	}
	
	visible_input.value = "";
	// reset task

	currentTask = createTask(getNewTaskStr());

	// reset elements
	sample_text.innerHTML = strToHTML(currentTask.text, 0, 0);
	input_text.value = ""

	percentage_text.innerText = "0%";
	wpm_text.innerText = "0";
	num_words_text.innerText = "0";
	accuracy_text.innerText = "0.00%";

	input_text.focus();
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
// btns
let export_btn = document.getElementById("export");
let new_btn = document.getElementById("new");
let randomize_btn = document.getElementById("randomize");
let load_btn = document.getElementById("load");
let file_input = document.getElementById("file");
let visible_input = document.getElementById("visibleinput");
let hide_btn = document.getElementById("hideinput");

// state vars
let randomize = false;
let currentTaskID = 0;
let inputhidden = false;

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
	if (event != -1 && !currentTask.hasError && event.key !== 'Enter') {
		input_text.value += event.key;
	
		let currentCharText = currentTask.text[currentTask.activeIndex];
		let input = event.key;

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
		
		sample_text.innerHTML = currentTask.text;
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

visible_input.addEventListener("keypress", (event) => {
	visible_input.value = ">";
	
	console.log(event.key);
	
	if (!currentTask.finished) {
		updateSampleHighlight(event);
	} else {
		if (event.key === 'r') {
			resetTaskState();
			event.preventDefault();
			visible_input.value = ">";
		}
	}
});
visible_input.addEventListener("keydown", (event) => {
	
	if (event.key == 'Backspace') {
		visible_input.value += visible_input.value.charAt(visible_input.value.length-1);

		if (currentTask.hasError) {
			// reset error state
			currentTask.hasError = false;
			// remove last char in input field
			input_text.value = input_text.value.slice(0, -1);
		}
		
		updateSampleHighlight(-1);
	}
})

visible_input.addEventListener("focus", () => {
	if (!visible_input.value) {
		visible_input.value = ">";
	}
	sample_text.classList.remove("gray");
});

visible_input.addEventListener("focusout", () => {
	visible_input.value = "";
	if (!sample_text.classList.contains("green")) {
		sample_text.classList.add("gray");
	}
});

export_btn.addEventListener("click", () => {
	if (currentTask.finished) {
		let textContent = `Prompt: ${currentTask.text}\n\nWPM: ${wpm_text.innerText}\nAccuracy: ${accuracy_text.innerText}`;

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

randomize_btn.addEventListener("click", () => {
	randomize_btn.blur()

	randomize = !randomize;
	if (randomize) {
		randomize_btn.classList.add("button-active");
	} else {
		randomize_btn.className = "";
	}
	resetTaskState();
})

load_btn.addEventListener("click", () => {
	load_btn.blur();
	file_input.click();
});

file_input.addEventListener("change", (event) => {
	file_input.blur();
	let selectedFiles = event.target.files;
	
	if (selectedFiles && selectedFiles.length > 0) {

		let selectedFile = selectedFiles[0];

		if (selectedFile.type === 'text/plain') {
			// FileReader to read the file content
			let reader = new FileReader();

			reader.onload = function(e) {
			  	let fileContent = e.target.result;
			  	
				copypastas = fileContent.split('\n');

				copypastas = copypastas.map((line) => {
					return line.replace(/\r?\n|\r/g, '');
				});
				copypastas = copypastas.filter((line) => {
					return line.trim() !== '';
				});

			  	resetTaskState();
			};

			reader.readAsText(selectedFile);
		} else {
			console.log('Please select a .txt file.');
		}
		// Here you can perform further operations with the selected file
	} else {
		console.log('No file selected.');
	}
});


new_btn.addEventListener("click", () => {
	new_btn.blur();
	input_text.focus();

	resetTaskState();
})

window.onload = () => {
	input_text.click();
}

input_text.addEventListener("click", () => {
	input_text.focus();
});

hide_btn.addEventListener("click", () => {
	inputhidden = !inputhidden;

	if (inputhidden) {
		hide_btn.classList.add("button-active");
		visible_input.className = "";
		visible_input.classList.add("black");
	} else {
		hide_btn.className = ""
		visible_input.className = "";
		visible_input.classList.add("gray");
	}
})