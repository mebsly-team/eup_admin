import { useCallback, useEffect, useState } from 'react';
import { Droppable, DropResult, DragDropContext } from '@hello-pangea/dnd';

import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import axiosInstance from 'src/utils/axios';

import Scrollbar from 'src/components/scrollbar';
import { IUserItem } from 'src/types/user';
import { IKanbanTask } from 'src/types/kanban';

import KanbanColumn from '../kanban-column';
import { KanbanColumnSkeleton } from '../kanban-skeleton';

// ----------------------------------------------------------------------
const columns = [
  {
    id: '0',
    name: 'DOEN',
  },
  {
    id: '1',
    name: 'ONDERHANDEN',
  },
  {
    id: '2',
    name: 'KLAAR',
  },
];

export default function KanbanView() {
  const [userList, setUserList] = useState<IUserItem[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [board, setBoard] = useState<IKanbanTask[]>([]);

  useEffect(() => {
    getAllTasks();
    if (!userList?.length) getAllUsers();
  }, []);

  const getAllTasks = async () => {
    setLoading(true)
    const { data } = await axiosInstance.get<IKanbanTask[]>(
      `/kanban/?nocache=true`
    );
    setBoard(data || []);
    setLoading(false)
  };

  const getAllUsers = async () => {
    const typeFilter = `&type=admin`;
    const { data } = await axiosInstance.get(
      `/users/?${typeFilter}`
    );
    setUserList(data || []);
  };

  const onDragEnd = useCallback(
    async ({ destination, source, draggableId }: DropResult) => {
      try {
        console.log('Drag end event:', { destination, source, draggableId });

        if (!destination) {
          console.log('No destination, cancelling drag');
          return;
        }

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
          console.log('Dropped in same position, cancelling drag');
          return;
        }

        // Get the task being moved - ensure draggableId is string
        const task = board.find((t) => String(t.id) === String(draggableId));
        if (!task) {
          console.log('Task not found:', draggableId);
          return;
        }

        console.log('Found task:', task);

        // Update task with new status as string
        const updatedTask = {
          ...task,
          status: destination.droppableId,
        };

        console.log('Updating task:', updatedTask);

        // Update task in backend first
        try {
          await axiosInstance.put(`/kanban/${task.id}/`, {
            ...task,
            status: destination.droppableId, // Keep status as string for backend
          });

          // If backend update successful, update local state
          setBoard(prevBoard =>
            prevBoard.map(item => String(item.id) === String(task.id) ? updatedTask : item)
          );

          console.log('Task updated successfully');
        } catch (error) {
          console.error('Error updating task in backend:', error);
          throw error;
        }

      } catch (error) {
        console.error('Error in drag and drop:', error);
        // Revert to previous state on error
        getAllTasks();
      }
    },
    [board]
  );

  const renderSkeleton = (
    <Stack direction="row" alignItems="flex-start" spacing={3}>
      {[...Array(3)].map((_, index) => (
        <KanbanColumnSkeleton key={index} index={index} />
      ))}
    </Stack>
  );

  return (
    <Container
      maxWidth={false}
      sx={{
        height: 1,
        px: { xs: 2, md: 3 },
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        Kanban
      </Typography>

      {isLoading && renderSkeleton}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" type="COLUMN" direction="horizontal">
          {(provided) => (
            <Scrollbar
              sx={{
                height: 1,
                minHeight: {
                  xs: '80vh',
                  md: 'calc(100vh - 200px)',
                },
              }}
            >
              <Stack
                ref={provided.innerRef}
                {...provided.droppableProps}
                spacing={3}
                direction="row"
                alignItems="flex-start"
                sx={{
                  p: 0.25,
                  width: '100%',
                }}
              >
                {columns?.map((col, index) => (
                  <KanbanColumn
                    index={index}
                    key={col.id}
                    column={col}
                    tasks={board.filter((item) => String(item.status) === String(col.id))}
                    userList={userList}
                    getAllTasks={getAllTasks}
                  />
                ))}

                {provided.placeholder}
              </Stack>
            </Scrollbar>
          )}
        </Droppable>
      </DragDropContext>
    </Container>
  );
}
