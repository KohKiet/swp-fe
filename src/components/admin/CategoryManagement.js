import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  Alert,
  CircularProgress,
  Fab,
  Tooltip,
  Stack,
  InputAdornment,
  Switch,
  FormControlLabel,
  Skeleton,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Category as CategoryIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as ViewIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { adminService } from "../../services";

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8],
  },
}));

const CategoryManagement = () => {
  // State management
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("card"); // 'card' or 'table'

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("create"); // 'create' or 'edit'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuCategory, setMenuCategory] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await adminService.getCategories();

      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        // Mock data for development
        console.warn("Using mock category data for development");
        setCategories([
          {
            id: "1",
            name: "Substance Awareness",
            description:
              "Basic education about various substances and their effects",
            isActive: true,
            courseCount: 12,
            createdAt: "2024-01-15T00:00:00Z",
          },
          {
            id: "2",
            name: "Prevention Programs",
            description:
              "Preventive measures and early intervention strategies",
            isActive: true,
            courseCount: 8,
            createdAt: "2024-01-20T00:00:00Z",
          },
          {
            id: "3",
            name: "Recovery Support",
            description: "Support systems and recovery methodologies",
            isActive: true,
            courseCount: 6,
            createdAt: "2024-02-01T00:00:00Z",
          },
          {
            id: "4",
            name: "Professional Training",
            description:
              "Training for healthcare and support professionals",
            isActive: false,
            courseCount: 4,
            createdAt: "2024-02-10T00:00:00Z",
          },
        ]);
      }
    } catch (err) {
      console.error("Error loading categories:", err);
      setError("Failed to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event, category) => {
    setAnchorEl(event.currentTarget);
    setMenuCategory(category);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuCategory(null);
  };

  const handleCreateCategory = () => {
    setDialogMode("create");
    setFormData({
      name: "",
      description: "",
      isActive: true,
    });
    setFormErrors({});
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleEditCategory = (category) => {
    setDialogMode("edit");
    setSelectedCategory(category);
    setFormData({
      name: category.name || "",
      description: category.description || "",
      isActive: category.isActive !== false,
    });
    setFormErrors({});
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleDeleteCategory = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Category name is required";
    } else if (formData.name.length > 100) {
      errors.name = "Category name must be less than 100 characters";
    }

    if (formData.description && formData.description.length > 500) {
      errors.description =
        "Description must be less than 500 characters";
    }

    // Check for duplicate names (case-insensitive)
    const isDuplicate = categories.some(
      (cat) =>
        cat.name.toLowerCase() === formData.name.toLowerCase() &&
        (dialogMode === "create" || cat.id !== selectedCategory?.id)
    );

    if (isDuplicate) {
      errors.name = "A category with this name already exists";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        isActive: formData.isActive,
      };

      let response;
      if (dialogMode === "create") {
        response = await adminService.createCategory(categoryData);
      } else {
        response = await adminService.updateCategory(
          selectedCategory.id,
          categoryData
        );
      }

      if (response.success) {
        setOpenDialog(false);
        loadCategories();
        setError("");
      } else {
        setError(response.message || "Failed to save category");
      }
    } catch (err) {
      console.error("Error saving category:", err);
      setError("Failed to save category. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setSubmitting(true);
      const response = await adminService.deleteCategory(
        categoryToDelete.id
      );

      if (response.success) {
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
        loadCategories();
        setError("");
      } else {
        setError(response.message || "Failed to delete category");
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      setError("Failed to delete category. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCategories = categories.filter(
    (category) =>
      category.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      category.description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const renderCategoryCard = (category) => (
    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={category.id}>
      <StyledCard>
        <CardContent sx={{ flexGrow: 1 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={2}>
            <CategoryIcon color="primary" sx={{ mr: 1 }} />
            <IconButton
              size="small"
              onClick={(e) => handleMenuClick(e, category)}>
              <MoreVertIcon />
            </IconButton>
          </Stack>

          <Typography variant="h6" component="h3" gutterBottom>
            {category.name}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}>
            {category.description || "No description"}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip
              label={category.isActive ? "Active" : "Inactive"}
              color={category.isActive ? "success" : "default"}
              size="small"
            />
            <Chip
              label={`${category.courseCount || 0} courses`}
              variant="outlined"
              size="small"
            />
          </Stack>

          <Typography variant="caption" color="text.secondary">
            Created:{" "}
            {new Date(category.createdAt).toLocaleDateString()}
          </Typography>
        </CardContent>

        <CardActions>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => handleEditCategory(category)}>
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => handleDeleteCategory(category)}>
            Delete
          </Button>
        </CardActions>
      </StyledCard>
    </Grid>
  );

  const renderTableView = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Courses</TableCell>
            <TableCell>Created</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredCategories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}>
                  <CategoryIcon color="primary" />
                  <Typography variant="subtitle2">
                    {category.name}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {category.description || "No description"}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={category.isActive ? "Active" : "Inactive"}
                  color={category.isActive ? "success" : "default"}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {category.courseCount || 0} courses
              </TableCell>
              <TableCell>
                {new Date(category.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell align="right">
                <IconButton
                  size="small"
                  onClick={() => handleEditCategory(category)}>
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteCategory(category)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderLoadingSkeleton = () => (
    <Grid container spacing={3}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
          <Card>
            <CardContent>
              <Skeleton
                variant="rectangular"
                height={40}
                sx={{ mb: 2 }}
              />
              <Skeleton variant="text" sx={{ mb: 1 }} />
              <Skeleton variant="text" sx={{ mb: 2 }} />
              <Stack direction="row" spacing={1}>
                <Skeleton
                  variant="rectangular"
                  width={60}
                  height={24}
                />
                <Skeleton
                  variant="rectangular"
                  width={80}
                  height={24}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{ mb: 2 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Category Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateCategory}
            size="large">
            Add Category
          </Button>
        </Stack>

        <Typography variant="body1" color="text.secondary">
          Manage course categories to organize your educational
          content
        </Typography>
      </Box>

      {/* Controls */}
      <Box sx={{ mb: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center">
          <TextField
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchTerm("")}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={viewMode === "table"}
                onChange={(e) =>
                  setViewMode(e.target.checked ? "table" : "card")
                }
              />
            }
            label="Table View"
          />
        </Stack>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Content */}
      {loading ? (
        renderLoadingSkeleton()
      ) : filteredCategories.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <CategoryIcon
            sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
          />
          <Typography
            variant="h6"
            color="text.secondary"
            gutterBottom>
            {searchTerm ? "No categories found" : "No categories yet"}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3 }}>
            {searchTerm
              ? "Try adjusting your search terms"
              : "Create your first category to organize courses"}
          </Typography>
          {!searchTerm && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateCategory}>
              Add First Category
            </Button>
          )}
        </Paper>
      ) : (
        <>
          {viewMode === "card" ? (
            <Grid container spacing={3}>
              {filteredCategories.map(renderCategoryCard)}
            </Grid>
          ) : (
            renderTableView()
          )}
        </>
      )}

      {/* Category Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}>
        <MenuItem onClick={() => handleEditCategory(menuCategory)}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleDeleteCategory(menuCategory)}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>
          {dialogMode === "create"
            ? "Add New Category"
            : "Edit Category"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Category Name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              error={!!formErrors.name}
              helperText={formErrors.name}
              fullWidth
              required
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              error={!!formErrors.description}
              helperText={formErrors.description}
              multiline
              rows={3}
              fullWidth
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={16} />
              ) : (
                <SaveIcon />
              )
            }>
            {dialogMode === "create" ? "Create" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the category "
            {categoryToDelete?.name}"? This action cannot be undone.
          </Typography>
          {categoryToDelete?.courseCount > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This category has {categoryToDelete.courseCount}{" "}
              associated courses. Deleting it may affect course
              organization.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={16} />
              ) : (
                <DeleteIcon />
              )
            }>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Add Button (Mobile) */}
      <Fab
        color="primary"
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          display: { xs: "flex", sm: "none" },
        }}
        onClick={handleCreateCategory}>
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default CategoryManagement;
