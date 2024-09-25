import { useMemo, useState, useCallback } from 'react';

import Paper from '@mui/material/Paper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import InputBase, { inputBaseClasses } from '@mui/material/InputBase';

import uuidv4 from 'src/utils/uuidv4';

import { _mock } from 'src/_mock';

import { IKanbanTask } from 'src/types/kanban';
import { useTranslate } from 'src/locales';

// ----------------------------------------------------------------------

type Props = {
  status: string;
  onCloseAddTask: VoidFunction;
  onAddTask: (task: IKanbanTask) => void;
};

// ... mevcut kod ...

export default function KanbanTaskAdd({ status, onAddTask, onCloseAddTask }: Props) {
  const [name, setName] = useState('');
  const { t } = useTranslate();

  const defaultTask: IKanbanTask = useMemo(
    () => ({
      id: uuidv4(),
      status,
      name: name.trim(),
      priority: 'medium',
      attachments: [],
      labels: [],
      comments: [],
      assignee: [],
      due: [null, null],
      reporter: {
        id: _mock.id(16),
        name: _mock.fullName(16),
        avatarUrl: _mock.image.avatar(16),
      },
    }),
    [name, status]
  );

  const handleKeyUpAddTask = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        if (name) {
          console.log('Adding task:', defaultTask); // Debug log
          onAddTask(defaultTask);
        } else {
          console.log('Task name is empty'); // Debug log
        }
      }
    },
    [defaultTask, name, onAddTask]
  );

  const handleClickAddTask = useCallback(() => {
    if (name) {
      console.log('Adding task:', defaultTask); // Debug log
      onAddTask(defaultTask);
    } else {
      console.log('Task name is empty, closing add task'); // Debug log
      onCloseAddTask();
    }
  }, [defaultTask, name, onAddTask, onCloseAddTask]);

  const handleChangeName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    console.log('Task name changed:', event.target.value); // Debug log
  }, []);

  return (
    <ClickAwayListener onClickAway={handleClickAddTask}>
      <Paper
        sx={{
          borderRadius: 1.5,
          bgcolor: 'background.default',
          boxShadow: (theme) => theme.customShadows.z1,
        }}
      >
        <InputBase
          autoFocus
          multiline
          fullWidth
          placeholder={t('task_name')}
          value={name}
          onChange={handleChangeName}
          onKeyUp={handleKeyUpAddTask}
          sx={{
            px: 2,
            height: 56,
            [`& .${inputBaseClasses.input}`]: {
              typography: 'subtitle2',
            },
          }}
        />
      </Paper>
    </ClickAwayListener>
  );
}