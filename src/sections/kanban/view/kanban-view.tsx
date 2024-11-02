import { useCallback, useEffect, useState } from 'react';
import { Droppable, DropResult, DragDropContext, Draggable } from '@hello-pangea/dnd';

import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { moveTask, deleteTask, useGetBoard } from 'src/api/kanban';

import Scrollbar from 'src/components/scrollbar';
import EmptyContent from 'src/components/empty-content';

import KanbanColumn from '../kanban-column';
import KanbanTaskAdd from '../kanban-task-add';
import { KanbanColumnSkeleton } from '../kanban-skeleton';
import { useTranslate } from 'src/locales';
import { IKanbanTask } from 'src/types/kanban';

// ----------------------------------------------------------------------

export default function KanbanView() {
  const { t } = useTranslate();

  const columns = [
    {
      id: 0,
      name: t('doing'),
    },
    {
      id: 1,
      name: t('review'),
    },
    {
      id: 2,
      name: t('test'),
    },
    {
      id: 3,
      name: t('done'),
    },
  ];
  const { board, boardLoading, boardEmpty } = useGetBoard();
  const [boardData, setBoardData] = useState(() => {
    const savedBoard = localStorage.getItem('kanbanBoard');
    if (savedBoard) {
      const parsedBoard = JSON.parse(savedBoard);
      // id'leri string'e çevir
      return parsedBoard?.map((task: IKanbanTask) => ({
        ...task,
        id: task.id.toString(),
      }));
    }
    return [];
  });

  useEffect(() => {
    if (board && board.length > 0 && boardData.length === 0) {
      setBoardData(board);
      localStorage.setItem('kanbanBoard', JSON.stringify(board));
    }
  }, [board, boardData]);

  useEffect(() => {
    if (boardData.length > 0) {
      localStorage.setItem('kanbanBoard', JSON.stringify(boardData));
    }
  }, [boardData]);

  const handleAddTask = useCallback((newTask: IKanbanTask) => {
    setBoardData((prevBoard: any) => [...prevBoard, newTask]);
  }, []);

  const handleUpdateTask = useCallback(
    (updatedTask: IKanbanTask) => {
      console.log('handleUpdateTask çağrıldı', updatedTask);
      setBoardData((prevBoard: any[]) =>
        prevBoard?.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
      localStorage.setItem(
        'kanbanBoard',
        JSON.stringify(
          boardData?.map((task: { id: string }) =>
            task.id === updatedTask.id ? updatedTask : task
          )
        )
      );
    },
    [boardData]
  );

  const handleDeleteTask = useCallback(
    async (taskId: string, columnId: string) => {
      try {
        await deleteTask(taskId, columnId);
        setBoardData((prevBoard: any[]) =>
          prevBoard?.filter((task: { id: string }) => task.id !== taskId)
        );
        localStorage.setItem(
          'kanbanBoard',
          JSON.stringify(boardData?.filter((task: { id: string }) => task.id !== taskId))
        );
      } catch (error) {
        console.error('Görev silme hatası:', error);
      }
    },
    [boardData]
  );

  const onDragEnd = useCallback(
    async ({ destination, source, draggableId, type }: DropResult) => {
      if (!destination) return;

      if (destination.droppableId === source.droppableId && destination.index === source.index) {
        return;
      }

      if (type === 'COLUMN') {
        const newOrdered = [...columns];
        newOrdered.splice(source.index, 1);
        newOrdered.splice(destination.index, 0, columns[source.index]);

        return;
      }

      const updatedBoard = [...boardData];
      const taskToMove = updatedBoard.find((task) => task.id === draggableId);

      if (taskToMove) {
        updatedBoard.splice(updatedBoard.indexOf(taskToMove), 1);

        taskToMove.status = parseInt(destination.droppableId, 10);

        updatedBoard.splice(destination.index, 0, taskToMove);

        setBoardData(updatedBoard);
        localStorage.setItem('kanbanBoard', JSON.stringify(updatedBoard));

        try {
          await moveTask(updatedBoard);
        } catch (error) {
          console.error('Görev taşıma hatası:', error);
        }
      }
    },
    [boardData, columns]
  );

  const renderSkeleton = (
    <Stack direction="row" alignItems="flex-start" spacing={3}>
      {[...Array(4)]?.map((_, index) => <KanbanColumnSkeleton key={index} index={index} />)}
    </Stack>
  );

  return (
    <Container
      maxWidth={false}
      sx={{
        height: 1,
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

      {boardLoading && renderSkeleton}

      {boardEmpty && (
        <EmptyContent
          filled
          title="No Data"
          sx={{
            py: 10,
            maxHeight: { md: 480 },
          }}
        />
      )}

      {!!boardData.length && (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="board" type="COLUMN" direction="horizontal">
            {(provided) => (
              <Scrollbar
                sx={{
                  height: '100%',
                  minHeight: {
                    xs: '80vh',
                    md: 'unset',
                  },
                }}
              >
                <Stack
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  spacing={3}
                  direction="row"
                  alignItems="flex-start"
                  sx={{
                    p: 0.25,
                    height: 'auto',
                  }}
                >
                  {columns?.map((col, index) => (
                    <Draggable key={col.id} draggableId={col.id.toString()} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <KanbanColumn
                            index={index}
                            column={col}
                            tasks={boardData?.filter(
                              (items: { status: number }) => items.status === col.id
                            )}
                            setBoardData={setBoardData}
                            onDeleteTask={handleDeleteTask}
                            onUpdateTask={handleUpdateTask}
                          >
                            <KanbanTaskAdd
                              status={col.id.toString()}
                              onAddTask={handleAddTask}
                              onCloseAddTask={() => {}}
                            />
                          </KanbanColumn>
                        </div>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}

                  {/* <KanbanColumnAdd /> */}
                </Stack>
              </Scrollbar>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </Container>
  );
}
