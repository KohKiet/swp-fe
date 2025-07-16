import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Alert,
  CircularProgress,
  Divider,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Quiz as QuizIcon,
  CheckCircle as CorrectIcon,
  Cancel as IncorrectIcon,
  DragHandle as DragIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { CheckCircle } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import adminService from "../../services/adminService";

const QuestionCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  "&:hover": {
    boxShadow: theme.shadows[4],
  },
}));

const AnswerOption = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(1),
  marginBottom: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  "&.correct": {
    backgroundColor: theme.palette.success.light + "20",
    borderColor: theme.palette.success.main,
  },
  "&.incorrect": {
    backgroundColor: theme.palette.error.light + "20",
    borderColor: theme.palette.error.main,
  },
}));

const QuizEditor = ({ quiz, onSave, onCancel }) => {
  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    passingScore: 70,
    timeLimit: 30, // default 30 min
    isFinalQuiz: false,
    maxAttempts: 1,
    allowRetry: true,
    retryDelayMinutes: 60,
    questions: [],
    ...quiz,
  });

  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    questionText: "",
    questionType: "multiple_choice", // multiple_choice, true_false, short_answer
    points: 1,
    orderIndex: 1,
    answers: [],
  });
  const [submitting, setSubmitting] = useState(false);

  // Initialize question form when editing
  useEffect(() => {
    if (editingQuestion) {
      setQuestionForm({
        questionText: editingQuestion.questionText || "",
        questionType:
          editingQuestion.questionType || "multiple_choice",
        points: editingQuestion.points || 1,
        orderIndex: editingQuestion.orderIndex || 1,
        answers: editingQuestion.answers || [],
      });
    }
  }, [editingQuestion]);

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionForm({
      questionText: "",
      questionType: "multiple_choice",
      points: 1,
      orderIndex: quizData.questions.length + 1,
      answers: [
        { answerText: "", isCorrect: false, orderIndex: 1 },
        { answerText: "", isCorrect: false, orderIndex: 2 },
      ],
    });
    setShowQuestionDialog(true);
  };

  const handleEditQuestion = (question, index) => {
    setEditingQuestion({ ...question, index });
    setShowQuestionDialog(true);
  };

  const handleDeleteQuestion = async (index) => {
    const question = quizData.questions[index];
    if (
      !window.confirm(
        "Are you sure you want to delete this question?"
      )
    )
      return;
    // If the question has an id (already saved in backend), delete from backend
    if (question.id) {
      try {
        setSubmitting(true);
        const res = await adminService.deleteQuestion(question.id);
        if (!res.success) {
          alert(
            res.error || "Failed to delete question from backend"
          );
          setSubmitting(false);
          return;
        }
      } catch (err) {
        alert(
          err.message || "Failed to delete question from backend"
        );
        setSubmitting(false);
        return;
      }
    }
    // Remove from local state
    const updatedQuestions = quizData.questions.filter(
      (_, i) => i !== index
    );
    // Reorder remaining questions
    const reorderedQuestions = updatedQuestions.map((q, i) => ({
      ...q,
      orderIndex: i + 1,
    }));
    setQuizData({ ...quizData, questions: reorderedQuestions });
    setSubmitting(false);
  };

  const handleQuestionTypeChange = (type) => {
    let answers = [];
    switch (type) {
      case "multiple_choice":
        answers = [
          { answerText: "", isCorrect: false, orderIndex: 1 },
          { answerText: "", isCorrect: false, orderIndex: 2 },
          { answerText: "", isCorrect: false, orderIndex: 3 },
          { answerText: "", isCorrect: false, orderIndex: 4 },
        ];
        break;
      case "true_false":
        answers = [
          { answerText: "True", isCorrect: false, orderIndex: 1 },
          { answerText: "False", isCorrect: false, orderIndex: 2 },
        ];
        break;
      case "short_answer":
        answers = [
          { answerText: "", isCorrect: true, orderIndex: 1 },
        ];
        break;
      default:
        answers = [];
    }
    setQuestionForm({ ...questionForm, questionType: type, answers });
  };

  const handleAnswerChange = (index, field, value) => {
    const updatedAnswers = [...questionForm.answers];
    updatedAnswers[index] = {
      ...updatedAnswers[index],
      [field]: value,
    };

    // For multiple choice and true/false, only one answer can be correct
    if (
      field === "isCorrect" &&
      value === true &&
      questionForm.questionType !== "short_answer"
    ) {
      updatedAnswers.forEach((answer, i) => {
        if (i !== index) {
          answer.isCorrect = false;
        }
      });
    }

    setQuestionForm({ ...questionForm, answers: updatedAnswers });
  };

  const addAnswerOption = () => {
    const newAnswer = {
      answerText: "",
      isCorrect: false,
      orderIndex: questionForm.answers.length + 1,
    };
    setQuestionForm({
      ...questionForm,
      answers: [...questionForm.answers, newAnswer],
    });
  };

  const removeAnswerOption = (index) => {
    const updatedAnswers = questionForm.answers.filter(
      (_, i) => i !== index
    );
    // Reorder remaining answers
    const reorderedAnswers = updatedAnswers.map((answer, i) => ({
      ...answer,
      orderIndex: i + 1,
    }));
    setQuestionForm({ ...questionForm, answers: reorderedAnswers });
  };

  const handleSaveQuestion = () => {
    // Validation
    if (!questionForm.questionText.trim()) {
      alert("Please enter a question text");
      return;
    }

    if (questionForm.questionType !== "short_answer") {
      const hasCorrectAnswer = questionForm.answers.some(
        (answer) => answer.isCorrect
      );
      if (!hasCorrectAnswer) {
        alert("Please mark at least one answer as correct");
        return;
      }
    }

    const hasEmptyAnswers = questionForm.answers.some(
      (answer) => !answer.answerText.trim()
    );
    if (hasEmptyAnswers) {
      alert("Please fill in all answer options");
      return;
    }

    // Save question
    let updatedQuestions = [...quizData.questions];

    if (
      editingQuestion !== null &&
      typeof editingQuestion.index === "number"
    ) {
      // Update existing question
      updatedQuestions[editingQuestion.index] = { ...questionForm };
    } else {
      // Add new question
      updatedQuestions.push({ ...questionForm });
    }

    setQuizData({ ...quizData, questions: updatedQuestions });
    setShowQuestionDialog(false);
  };

  const handleSaveQuiz = async () => {
    if (!quizData.title.trim()) {
      alert("Please enter a quiz title");
      return;
    }
    if (quizData.questions.length === 0) {
      alert("Please add at least one question");
      return;
    }
    const lessonId = quiz.lessonId || quizData.lessonId;
    if (!lessonId) {
      alert(
        "Error: lessonId is missing. Cannot create quiz without a lesson."
      );
      return;
    }
    setSubmitting(true);
    try {
      const quizPayload = {
        lessonId,
        title: quizData.title,
        description: quizData.description,
        isFinalQuiz: quizData.isFinalQuiz ?? false,
        timeLimitMinutes: Number(quizData.timeLimit) || 30,
        passingScore: Number(quizData.passingScore) || 70,
        maxAttempts: Number(quizData.maxAttempts) || 1,
        allowRetry: quizData.allowRetry ?? true,
        retryDelayMinutes: Number(quizData.retryDelayMinutes) || 60,
      };
      console.log("Quiz payload being sent:", quizPayload);
      const quizRes = await adminService.createQuiz(quizPayload);
      console.log("Quiz creation backend response:", quizRes);
      const quizId = quizRes.data.quizId || quizRes.data.id;
      if (!quizRes.success || !quizId) {
        console.error(
          "Quiz creation failed. Full response:",
          quizRes
        );
        alert(
          quizRes.error ||
            (quizRes.data && quizRes.data.message) ||
            "Failed to create quiz. See console for details."
        );
        return;
      }
      for (const [i, q] of quizData.questions.entries()) {
        const questionPayload = {
          quizId,
          content: q.questionText,
          questionType: q.questionType,
          questionOrder: i + 1,
          answers: q.answers.map((a) => ({
            answerText: a.answerText,
            isCorrect: a.isCorrect,
          })),
        };
        const questionRes = await adminService.createQuestion(
          questionPayload
        );
        if (!questionRes.success) {
          alert(
            questionRes.error ||
              (questionRes.data && questionRes.data.message) ||
              "Failed to create question: " + q.questionText
          );
          throw new Error(
            questionRes.error ||
              (questionRes.data && questionRes.data.message) ||
              "Failed to create question: " + q.questionText
          );
        }
      }
      await onSave();
    } catch (error) {
      // Log the full error object for debugging
      console.error(
        "Error saving quiz:",
        error,
        error?.response,
        error?.data
      );
      alert(
        "Failed to save quiz. " +
          (error?.message ||
            error?.response?.data?.message ||
            error?.data?.message ||
            "See console for details.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getTotalPoints = () => {
    return quizData.questions.reduce(
      (total, question) => total + (question.points || 1),
      0
    );
  };

  const renderQuestionPreview = (question, index) => (
    <QuestionCard key={index}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              Question {index + 1}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {question.questionText}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Chip
                label={question.questionType
                  .replace("_", " ")
                  .toUpperCase()}
                size="small"
                variant="outlined"
              />
              <Chip
                label={`${question.points || 1} point${
                  (question.points || 1) !== 1 ? "s" : ""
                }`}
                size="small"
              />
            </Stack>
          </Box>
          <Box>
            <IconButton
              onClick={() => handleEditQuestion(question, index)}>
              <EditIcon />
            </IconButton>
            <IconButton
              onClick={() => handleDeleteQuestion(index)}
              color="error"
              disabled={submitting}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Answer Options */}
        <Box>
          {question.questionType === "short_answer" ? (
            <AnswerOption className="correct">
              <CheckCircle sx={{ mr: 1, color: "success.main" }} />
              <Typography variant="body2">
                Short answer question (manually graded)
              </Typography>
            </AnswerOption>
          ) : (
            question.answers?.map((answer, answerIndex) => (
              <AnswerOption
                key={answerIndex}
                className={
                  answer.isCorrect ? "correct" : "incorrect"
                }>
                {answer.isCorrect ? (
                  <CorrectIcon
                    sx={{ mr: 1, color: "success.main" }}
                  />
                ) : (
                  <IncorrectIcon
                    sx={{ mr: 1, color: "error.main" }}
                  />
                )}
                <Typography variant="body2">
                  {answer.answerText}
                </Typography>
              </AnswerOption>
            ))
          )}
        </Box>
      </CardContent>
    </QuestionCard>
  );

  return (
    <Box>
      {/* Quiz Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <QuizIcon />
            Quiz Settings
          </Typography>

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Quiz Title"
                fullWidth
                value={quizData.title}
                onChange={(e) =>
                  setQuizData({ ...quizData, title: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Passing Score (%)"
                type="number"
                fullWidth
                value={quizData.passingScore}
                onChange={(e) =>
                  setQuizData({
                    ...quizData,
                    passingScore: Number(e.target.value),
                  })
                }
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Time Limit (minutes)"
                type="number"
                fullWidth
                value={quizData.timeLimit}
                onChange={(e) =>
                  setQuizData({
                    ...quizData,
                    timeLimit: Number(e.target.value) || 0,
                  })
                }
                inputProps={{ min: 0 }}
                helperText="0 = No time limit"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={quizData.description}
                onChange={(e) =>
                  setQuizData({
                    ...quizData,
                    description: e.target.value,
                  })
                }
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Quiz Stats */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quiz Statistics
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 3 }}>
              <Typography variant="h4" color="primary.main">
                {quizData.questions.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Questions
              </Typography>
            </Grid>
            <Grid size={{ xs: 3 }}>
              <Typography variant="h4" color="primary.main">
                {getTotalPoints()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Points
              </Typography>
            </Grid>
            <Grid size={{ xs: 3 }}>
              <Typography variant="h4" color="primary.main">
                {quizData.passingScore}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Passing Score
              </Typography>
            </Grid>
            <Grid size={{ xs: 3 }}>
              <Typography variant="h4" color="primary.main">
                {quizData.timeLimit || "∞"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Time Limit (min)
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Questions Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Questions ({quizData.questions.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddQuestion}>
          Add Question
        </Button>
      </Box>

      {/* Questions List */}
      {quizData.questions.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <QuizIcon
              sx={{ fontSize: 64, color: "grey.400", mb: 2 }}
            />
            <Typography
              variant="h6"
              color="text.secondary"
              gutterBottom>
              No questions yet
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3 }}>
              Start building your quiz by adding the first question
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddQuestion}>
              Add Question
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box>{quizData.questions.map(renderQuestionPreview)}</Box>
      )}

      {/* Action Buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
          mt: 4,
        }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSaveQuiz}
          disabled={submitting}
          startIcon={
            submitting ? <CircularProgress size={16} /> : <SaveIcon />
          }>
          Save Quiz
        </Button>
      </Box>

      {/* Question Dialog */}
      <Dialog
        open={showQuestionDialog}
        onClose={() => setShowQuestionDialog(false)}
        maxWidth="md"
        fullWidth>
        <DialogTitle>
          {editingQuestion ? "Edit Question" : "Add New Question"}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              mt: 2,
            }}>
            {/* Question Text */}
            <TextField
              label="Question Text"
              fullWidth
              multiline
              rows={3}
              value={questionForm.questionText}
              onChange={(e) =>
                setQuestionForm({
                  ...questionForm,
                  questionText: e.target.value,
                })
              }
            />

            {/* Question Type and Points */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 8 }}>
                <FormControl fullWidth>
                  <InputLabel>Question Type</InputLabel>
                  <Select
                    value={questionForm.questionType}
                    label="Question Type"
                    onChange={(e) =>
                      handleQuestionTypeChange(e.target.value)
                    }>
                    <MenuItem value="multiple_choice">
                      Multiple Choice
                    </MenuItem>
                    <MenuItem value="true_false">True/False</MenuItem>
                    <MenuItem value="short_answer">
                      Short Answer
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <TextField
                  label="Points"
                  type="number"
                  fullWidth
                  value={questionForm.points}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      points: parseInt(e.target.value),
                    })
                  }
                  inputProps={{ min: 1 }}
                />
              </Grid>
            </Grid>

            {/* Answer Options */}
            {questionForm.questionType !== "short_answer" && (
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}>
                  <Typography variant="h6">Answer Options</Typography>
                  {questionForm.questionType ===
                    "multiple_choice" && (
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={addAnswerOption}>
                      Add Option
                    </Button>
                  )}
                </Box>

                {questionForm.answers.map((answer, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}>
                    <Checkbox
                      checked={answer.isCorrect}
                      onChange={(e) =>
                        handleAnswerChange(
                          index,
                          "isCorrect",
                          e.target.checked
                        )
                      }
                      color="success"
                    />
                    <TextField
                      fullWidth
                      label={`Option ${index + 1}`}
                      value={answer.answerText}
                      onChange={(e) =>
                        handleAnswerChange(
                          index,
                          "answerText",
                          e.target.value
                        )
                      }
                      disabled={
                        questionForm.questionType === "true_false"
                      }
                    />
                    {questionForm.questionType ===
                      "multiple_choice" &&
                      questionForm.answers.length > 2 && (
                        <IconButton
                          onClick={() => removeAnswerOption(index)}
                          color="error">
                          <DeleteIcon />
                        </IconButton>
                      )}
                  </Box>
                ))}

                <Alert severity="info" sx={{ mt: 2 }}>
                  {questionForm.questionType === "multiple_choice"
                    ? "Check the box next to the correct answer(s)"
                    : "Select True or False as the correct answer"}
                </Alert>
              </Box>
            )}

            {questionForm.questionType === "short_answer" && (
              <Alert severity="info">
                Short answer questions will need to be graded manually
                by instructors.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQuestionDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveQuestion} variant="contained">
            {editingQuestion ? "Update" : "Add"} Question
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuizEditor;
