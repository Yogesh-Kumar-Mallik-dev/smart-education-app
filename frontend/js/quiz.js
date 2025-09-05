const quizData = [
    {
        question: "What is the capital of France?",
        options: ["Berlin", "Madrid", "Paris", "Rome"],
        answer: "Paris"
    },
    {
        question: "Which planet is known as the Red Planet?",
        options: ["Earth", "Mars", "Jupiter", "Saturn"],
        answer: "Mars"
    },
    {
        question: "Who wrote 'Romeo and Juliet'?",
        options: ["William Shakespeare", "Mark Twain", "Charles Dickens", "Jane Austen"],
        answer: "William Shakespeare"
    },
    {
        question: "What is the boiling point of water at sea level?",
        options: ["90°C", "100°C", "110°C", "120°C"],
        answer: "100°C"
    },
    {
        question: "What is the largest ocean on Earth?",
        options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
        answer: "Pacific Ocean"
    },
    {
        question: "Which element has the chemical symbol 'O'?",
        options: ["Gold", "Oxygen", "Silver", "Iron"],
        answer: "Oxygen"
    },
    {
        question: "Who painted the Mona Lisa?",
        options: ["Vincent Van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Claude Monet"],
        answer: "Leonardo da Vinci"
    },
    {
        question: "What is the smallest prime number?",
        options: ["0", "1", "2", "3"],
        answer: "2"
    },
    {
        question: "Which language is primarily spoken in Brazil?",
        options: ["Spanish", "Portuguese", "French", "English"],
        answer: "Portuguese"
    },
    {
        question: "What gas do plants absorb from the atmosphere?",
        options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
        answer: "Carbon Dioxide"
    }
];


        let currentQuestionIndex = 0;
        let score = 0;
        let selectedOption = null;

        const container = document.querySelector('.container');
        const startScreen = document.getElementById('start-screen');
        const startBtn = document.getElementById('start-btn');

        startBtn.addEventListener('click', startQuiz);

        function startQuiz() {
            startScreen.style.display = 'none';
            showQuestion();
        }

        function showQuestion() {
            selectedOption = null;
            const currentQuestion = quizData[currentQuestionIndex];

            container.innerHTML = `
                <div class="question-container">
                    <h2 id="question">${currentQuestion.question}</h2>
                    <ul id="options"></ul>
                    <button id="next-btn" disabled>Next</button>
                    <div id="result"></div>
                </div>
            `;

            const optionsUl = document.getElementById('options');
            const nextBtn = document.getElementById('next-btn');
            const resultDiv = document.getElementById('result');

            currentQuestion.options.forEach(option => {
                const li = document.createElement('li');
                li.textContent = option;
                li.addEventListener('click', () => {
                    // Clear previous selection
                    Array.from(optionsUl.children).forEach(child => {
                        child.classList.remove('selected');
                    });
                    li.classList.add('selected');
                    selectedOption = option;
                    nextBtn.disabled = false;
                    resultDiv.textContent = '';
                });
                optionsUl.appendChild(li);
            });

            nextBtn.addEventListener('click', () => {
                if (selectedOption === currentQuestion.answer) {
                    score++;
                }
                currentQuestionIndex++;
                if (currentQuestionIndex < quizData.length) {
                    showQuestion();
                } else {
                    showResults();
                }
            });
        }

        function showResults() {
            container.innerHTML = `
                <div class="result-screen" style="text-align:center;">
                    <h2>Your Score: ${score} / ${quizData.length}</h2>
                    <button class="restart-btn" id="restart-btn">Restart Quiz</button>
                </div>
            `;

            document.getElementById('restart-btn').addEventListener('click', () => {
                currentQuestionIndex = 0;
                score = 0;
                container.innerHTML = `
                    <div class="logo">
                        <h1>SmartEd Quiz</h1>
                        <p>Test your knowledge and learn more!</p>
                    </div>
                    <div class="start-screen" id="start-screen">
                        <p>Welcome to our interactive quiz on general education topics. Answer multiple choice questions and see your results.</p>
                        <button class="start-btn" id="start-btn">Start Quiz</button>
                    </div>
                `;
                // Re-attach event listener for start button
                document.getElementById('start-btn').addEventListener('click', startQuiz);
            });
        }