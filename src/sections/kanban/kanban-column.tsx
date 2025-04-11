import { useCallback } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { alpha, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSnackbar } from 'src/components/snackbar';
import Iconify from 'src/components/iconify';

import { IKanbanTask, IKanbanColumn } from 'src/types/kanban';
import { IUserItem } from 'src/types/user';

import KanbanTaskAdd from './kanban-task-add';
import KanbanTaskItem from './kanban-task-item';
import Box from '@mui/material/Box';
import axiosInstance from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

type Props = {
  column: IKanbanColumn;
  tasks: IKanbanTask[];
  index: number;
  userList: IUserItem[];
  getAllTasks: () => void;
};

export default function KanbanColumn({ column, tasks, index, userList, getAllTasks }: Props) {
  const theme = useTheme();
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const openAddTask = useBoolean();

  const handleAddTask = useCallback(
    async (taskData: IKanbanTask) => {
      try {
        await axiosInstance.post(`/kanban/`, taskData);
        openAddTask.onFalse();
        getAllTasks();
      } catch (error) {
        console.error(error);
        enqueueSnackbar('Error adding task', { variant: 'error' });
      }
    },
    [column.id, openAddTask, getAllTasks, enqueueSnackbar]
  );

  const handleUpdateTask = useCallback(async (taskData: IKanbanTask) => {
    try {
      await axiosInstance.put(`/kanban/${taskData.id}/`, taskData);
      getAllTasks();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error updating task', { variant: 'error' });
    }
  }, [getAllTasks, enqueueSnackbar]);

  const handleAddComment = useCallback(async (id: string, commentData: { commenter: string; comment: string }) => {
    try {
      if (!commentData.commenter || !commentData.comment) {
        enqueueSnackbar('Commenter and comment are required', { variant: 'error' });
        return;
      }

      await axiosInstance.post(`/kanban/${id}/add_comment/`, {
        commenter: parseInt(commentData.commenter),
        comment: commentData.comment.trim()
      });
      getAllTasks();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error adding comment', { variant: 'error' });
    }
  }, [getAllTasks, enqueueSnackbar]);

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      try {
        await axiosInstance.delete(`/kanban/${taskId}/`);
        getAllTasks();
        enqueueSnackbar('Task deleted successfully', {
          variant: 'success',
          anchorOrigin: { vertical: 'top', horizontal: 'center' },
        });
      } catch (error) {
        console.error(error);
        enqueueSnackbar('Error deleting task', { variant: 'error' });
      }
    },
    [getAllTasks, enqueueSnackbar]
  );

  const renderAddTask = (
    <Stack
      spacing={2}
      sx={{
        pb: 3,
      }}
    >
      {openAddTask.value && (
        <KanbanTaskAdd
          status={column.id}
          onAddTask={handleAddTask}
          onCloseAddTask={openAddTask.onFalse}
          reporter={user.id}
        />
      )}

      <Button
        fullWidth
        size="large"
        color="inherit"
        startIcon={
          <Iconify
            icon={openAddTask.value ? 'solar:close-circle-broken' : 'mingcute:add-line'}
            width={18}
            sx={{ mr: -0.5 }}
          />
        }
        onClick={openAddTask.onToggle}
        sx={{
          fontSize: 14,
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
          '&:hover': {
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.16),
          },
        }}
      >
        {openAddTask.value ? 'Close' : 'Taak toevoegen'}
      </Button>
    </Stack>
  );

  return (
    <Droppable droppableId={column.id} type="TASK">
      {(provided, snapshot) => (
        <Paper
          ref={provided.innerRef}
          {...provided.droppableProps}
          sx={{
            width: 280,
            minHeight: 600,
            borderRadius: 2,
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
            border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
            ...(snapshot.isDraggingOver && {
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.12),
            }),
          }}
        >
          <Stack sx={{ height: '100%' }}>
            <Box
              sx={{
                px: 2,
                py: 2,
                borderBottom: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
              }}
            >
              <Typography variant="h6" sx={{
                textAlign: "center",
                color: (theme) => {
                  switch (column.name) {
                    case 'DOEN':
                      return theme.palette.info.main;
                    case 'ONDERHANDEN':
                      return theme.palette.warning.main;
                    case 'KLAAR':
                      return theme.palette.success.main;
                    default:
                      return theme.palette.text.primary;
                  }
                }
              }}>
                {column.name}
                <Typography component="span" sx={{ ml: 1, color: 'text.secondary' }}>
                  ({tasks.length})
                </Typography>
              </Typography>
            </Box>

            <Stack
              spacing={2}
              sx={{
                px: 2,
                py: 2,
                flexGrow: 1,
              }}
            >
              {tasks.map((task, taskIndex) => {
                const taskId = String(task.id);
                return (
                  <Draggable key={taskId} draggableId={taskId} index={taskIndex}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          ...provided.draggableProps.style,
                          opacity: snapshot.isDragging ? 0.8 : 1,
                        }}
                      >
                        <KanbanTaskItem
                          task={{ ...task, id: taskId }}
                          index={taskIndex}
                          column={column}
                          assignee={userList?.find(u => String(u.id) === String(task.assignee))}
                          reporter={userList?.find(u => String(u.id) === String(task.reporter))}
                          onDeleteTask={() => handleDeleteTask(taskId)}
                          onUpdateTask={handleUpdateTask}
                          userList={userList}
                          handleAddComment={handleAddComment}
                        />
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </Stack>

            <Box sx={{ px: 2, pb: 2 }}>
              {renderAddTask}
            </Box>
          </Stack>
        </Paper>
      )}
    </Droppable>
  );
}
