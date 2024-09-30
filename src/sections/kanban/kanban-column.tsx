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
import { useTranslate } from 'src/locales';
import uuidv4 from 'src/utils/uuidv4';

// ----------------------------------------------------------------------

type Props = {
  column: IKanbanColumn;
  tasks: Record<string, IKanbanTask>;
  index: number;
  setBoardData: React.Dispatch<React.SetStateAction<IKanbanTask[]>>;
  onDeleteTask: (taskId: string) => void;
};

export default function KanbanColumn({ column, tasks, index, setBoardData, onDeleteTask }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslate();

  const openAddTask = useBoolean();

  const handleUpdateColumn = useCallback(
    async (columnName: string) => {
      try {
        if (column.name !== columnName) {
          updateColumn(column.id, columnName);

          enqueueSnackbar('Update success!', {
            anchorOrigin: { vertical: 'top', horizontal: 'center' },
          });
        }
      } catch (error) {
        console.error(error);
      }
    },
    [column.id, column.name, enqueueSnackbar]
  );

  const handleClearColumn = useCallback(async () => {
    try {
      clearColumn(column.id);
    } catch (error) {
      console.error(error);
    }
  }, [column.id]);

  const handleDeleteColumn = useCallback(async () => {
    try {
      deleteColumn(column.id);

      enqueueSnackbar('Delete success!', {
        anchorOrigin: { vertical: 'top', horizontal: 'center' },
      });
    } catch (error) {
      console.error(error);
    }
  }, [column.id, enqueueSnackbar]);

  const handleAddTask = useCallback(
    async (taskData: Omit<IKanbanTask, 'id' | 'status'>) => {
      try {
        const newTask: IKanbanTask = {
          ...taskData,
          id: uuidv4(), // UUID oluşturmak için bir fonksiyon kullanın
          status: parseInt(column.id, 10),
        };
        await createTask(column.id, newTask);
        setBoardData((prevBoard) => [...prevBoard, newTask]);
        openAddTask.onFalse();
      } catch (error) {
        console.error(error);
      }
    },
    [column.id, openAddTask, setBoardData]
  );

  const handleUpdateTask = useCallback(async (updatedTask: IKanbanTask) => {
    try {
      updateTask(updatedTask);
      setBoardData((prevBoard) =>
        prevBoard.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
    } catch (error) {
      console.error(error);
    }
  }, [setBoardData]);

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      try {
        deleteTask(column.id, taskId);

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
          status={column.name}
          onAddTask={handleAddTask}
          onCloseAddTask={openAddTask.onFalse}
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
        {openAddTask.value ? t('dichtbij') : t('taak_toevoegen')}
      </Button>
    </Stack>
  );

  return (
    <Droppable droppableId={column.id.toString()} type="TASK">
   {(provided, snapshot) => (
    <Paper
      ref={provided.innerRef}
      {...provided.droppableProps}
      sx={{
        px: 2,
        borderRadius: 2,
        bgcolor: 'background.neutral',
        ...(snapshot.isDragging && {
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.24),
        }),
      }}
    >
      <Stack {...provided.dragHandleProps}>
          <KanbanColumnToolBar
              columnName={column.name}
              onUpdateColumn={handleUpdateColumn}
              onClearColumn={handleClearColumn}
              onDeleteColumn={handleDeleteColumn}
            />

        {tasks.map((item, taskIndex) => (
          <Draggable key={item.id.toString()} draggableId={item.id.toString()} index={taskIndex}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
              >
                <KanbanTaskItem
                  task={item}
                  onDeleteTask={() => onDeleteTask(item.id)}
                  onUpdateTask={handleUpdateTask}
                />
              </div>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      
        {renderAddTask}
          </Stack>
        </Paper>
    )}
  </Droppable>
  );
}
