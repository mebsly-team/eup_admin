import { useCallback } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';

import { useBoolean } from 'src/hooks/use-boolean';

import {
  createTask,
  updateTask,
  deleteTask,
  clearColumn,
  updateColumn,
  deleteColumn,
} from 'src/api/kanban';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';

import { IKanbanTask, IKanbanColumn } from 'src/types/kanban';

import KanbanTaskAdd from './kanban-task-add';
import KanbanTaskItem from './kanban-task-item';
import KanbanColumnToolBar from './kanban-column-tool-bar';
import Box from '@mui/material/Box';
import axiosInstance from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

type Props = {
  column: IKanbanColumn;
  tasks: Record<string, IKanbanTask>;
  index: number;
  userList: any;
};

export default function KanbanColumn({ column, tasks, index, userList, getAllTasks }: Props) {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const openAddTask = useBoolean();

  const handleAddTask = useCallback(
    async (taskData: IKanbanTask) => {
      try {
        const response = await axiosInstance.post(`/kanban/`, taskData);

        openAddTask.onFalse();
        getAllTasks();
      } catch (error) {
        console.error(error);
        enqueueSnackbar({ variant: 'error', message: t('error') });
      }
    },
    [column.id, openAddTask]
  );

  const handleUpdateTask = useCallback(async (id, taskData: IKanbanTask) => {
    try {
      const response = await axiosInstance.put(`/kanban/${id}/`, taskData);
      getAllTasks();
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleAddComment = useCallback(async (id, taskData: IKanbanTask) => {
    try {
      const response = await axiosInstance.post(`/kanban/${id}/add_comment/`, taskData);
      getAllTasks();
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      try {
        const response = await axiosInstance.delete(`/kanban/${taskId}/`);
        getAllTasks();

        enqueueSnackbar('Delete success!', {
          anchorOrigin: { vertical: 'top', horizontal: 'center' },
        });
      } catch (error) {
        console.error(error);
      }
    },
    [column.id, enqueueSnackbar]
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
        sx={{ fontSize: 14 }}
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
          {...provided.draggableProps}
          sx={{
            px: 2,
            borderRadius: 2,
            width: '300px',
            minWidth: '100px',
            bgcolor: 'background.neutral',
            ...(snapshot.isDragging && {
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.24),
            }),
          }}
        >
          <Stack {...provided.dragHandleProps}>
            <Box sx={{ p: 1, borderBottom: `solid 1px black`, textAlign: 'center' }}>
              {column.name}
            </Box>
            {tasks.map((item, taskIndex) => {
              return (
                <Draggable key={item.id} draggableId={item.id} index={taskIndex}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Box sx={{ mb: 1 }}>
                        <KanbanTaskItem
                          column={column}
                          task={item}
                          assignee={userList?.find((u) => u.id === item.assignee)}
                          reporter={userList?.find((u) => u.id === item.reporter)}
                          onDeleteTask={() => handleDeleteTask(item.id)}
                          index={taskIndex}
                          onUpdateTask={handleUpdateTask}
                          userList={userList}
                          handleAddComment={handleAddComment}
                        />
                      </Box>
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}

            {renderAddTask}
          </Stack>
        </Paper>
      )}
    </Droppable>
  );
}
