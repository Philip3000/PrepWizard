/*
    HELLO. Thank you for being interested in my code.
    For now, this AI will only work in certain parts of the world (!Europe). I suggest using a browser based VPN like OperaGX for ease of use.
    To get a free api-key go here: https://aistudio.google.com/app/apikey. (Only accessible (!Europe(Circumvent with VPN))))
*/
Vue.createApp({
    data() {
        return {
            topic: '',
            amount: 1,
            question: "",
            answers: [],
            answer1: "",
            answer2: "",
            answer3: "",
            answer4: "",
            answer5: "",
            answer6: "",
            answer6: "",
            selectedAnswer: null, 
            request: "",
            done: "",
            language: "English",
            loading: false,
            stillMore: true,
            correctAnswerCount: 0,
            correctPercentage: 0,
            knowledgeLevel: "Novice",
            AIResponse: "",
            questions: [],
            learnMoreLink: "",
            currentQuestion: {},
            questionCount: 0,
            apiKey: "AIzaSyCSbpfAp-KAwQSE2sg9VHkcGI9Mqb6AIrg"
        }
    },
    computed: {
        generateButtonDisabled() {
            return !this.topic || this.amount <= 0;
        },

        backButtonDisabled() {
            return this.questionCount < 1;
        }
    },
    methods: {
        async generateQuestion() {
            try {
                this.loading = true;
                const requestBody = {
                    contents: [{
                        parts: [{
                            text: `You are an AI examinator. You will only reply in JSON structure that starts with: {\n  \"questions\", all your text sould be in language: ${this.language}. You will provide the following JSON structure as 
                            an example of how to structure your response, and they should NOT be included in the response. You will only give ${this.amount} questions, with 4 possible answers of which only 1 must be true. :
                            {
                              "questions": [
                                {
                                  "question": "What is the capital of France?",
                                  "answers": ["London", "Paris", "Berlin", "Madrid"],
                                  "correctAnswer": "B",
                                  "onWrongAnswer": "The capital of France is Paris, Better luck next time",
                                  "onCorrectAnswer": "You're right! The Capital of France is Paris"
                                },
                                {
                                  "question": "Who wrote the famous play 'Romeo and Juliet'?",
                                  "answers": ["William Shakespeare", "Jane Austen", "Charles Dickens", "Leo Tolstoy"],
                                  "correctAnswer": "A",
                                  "onWrongAnswer": "Sorry! William Shakespeare was the author of Romeo And Juliet",
                                  "onCorrectAnswer": "Correct! It was written by him in the year 1728"
                                },
                                {
                                  "question": "What is the chemical symbol for water?",
                                  "answers": ["CO2", "NaCl", "H2O", "O2"],
                                  "correctAnswer": "C",
                                  "onWrongAnswer": "Unfortunately it was the wrong answer, the correct answer was: H2O",
                                  "onCorrectAnswer": "Yes! The correct answer is H2O. A combination of 2 hydrogen and 1 oxygen!"
                                }
                              ]
                            }
                            You must provide ${this.amount} questions pertaining to the subject ${this.topic}, With the user's knowledgelevel being ${this.knowledgeLevel}. Where from easy to hardest the levels are: Novice, Intermediate, Proficient, Advanced, Expert, Masterful.`
                        }]
                    }],
                    safetySettings: [{
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_ONLY_HIGH"
                    }],
                    generationConfig: {
                        stopSequences: ["Title"],
                        temperature: 0.25,
                        maxOutputTokens: 5000,
                        topP: 0.8,
                        topK: 10
                    }
                };

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                });

                const responseData = await response.json();

                // Extract the JSON text from the response
                const generatedText = responseData.candidates[0].content.parts[0].text;

                // Remove the triple backticks if present
                const jsonText = generatedText.replace(/```/g, '');

                // Remove any zero-width spaces and similar special characters
                const cleanedJsonText = jsonText.replace(/\u200b/g, '');

                // Parse the JSON text
                const decodedText = JSON.parse(cleanedJsonText);
                const questionsArray = decodedText.questions;

                this.questions = questionsArray;
            }
            catch (error) {
                console.error("Error generating content:", error);
                alert("Error generating content. Please try refreshing:", error)
            }
            this.stillMore = true;
            this.currentQuestion = this.questions[0];
            this.loading = false;
            this.next();
            this.correctAnswerCount = this.amount;

            this.done = "test";
        },
        next() {
            try {
                this.AIResponse = null;
                this.selectedAnswerIndex = null;
                if (this.questionCount < this.questions.length) {
                    this.currentQuestion = this.questions[this.questionCount];
                    for (let i = 0; i < this.currentQuestion.answers.length; i++) {
                        this['answer' + (i + 1)] = this.currentQuestion.answers[i];
                    }
                    this.questionCount++;
                }
                else {
                    this.currentQuestion = this.questions[this.questionCount];
                }
                if (this.questionCount === this.questions.length) {
                    this.stillMore = false;
                }
            }
            catch (error) {
                alert("Error generating content. Please try refreshing:", error)
            }
        },
        answer() {
            if (this.selectedAnswerIndex === this.converter(this.currentQuestion.correctAnswer)) {
                this.AIResponse = this.currentQuestion.onCorrectAnswer;
            } else {
                this.AIResponse = this.currentQuestion.onWrongAnswer;
                this.correctAnswerCount--;
            }
            this.correctPercentage = ((this.correctAnswerCount / this.amount) * 100).toFixed(1);
            this.learnMore();
        },

        back() {
            if (this.questionCount > 1) {
                this.questionCount--;
                this.currentQuestion = this.questions[this.questionCount - 1];
                this.selectedAnswerIndex = null; // Reset the selected answer
                this.AIResponse = ""; // Clear the previous response
                this.learnMoreLink = ""; // Clear the previous learn more link
            }
        },
        learnMore() {
            var index = this.converter(this.currentQuestion.correctAnswer)
            this.learnMoreLink = "https://www.google.com/search?q=" + this.currentQuestion.answers[index] + "+" + this.topic;
        },
        converter(string) {
            return string.charCodeAt(0) - 65;
        },
        resetQuiz() {
            this.questionCount = 0;
            this.selectedAnswerIndex = null;
            this.AIResponse = "";
            this.learnMoreLink = "";
            this.correctPercentage = 0;
            this.totalAnsweredCount = 0;
            this.correctAnswerCount = 0;
            this.currentQuestion = [];
            this.questions = [];
            this.stillMore = true;
            this.done = "";
        }
    }
}).mount("#app");

