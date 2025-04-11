import { useMemo, useState, useCallback } from 'react';

import Paper from '@mui/material/Paper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import InputBase, { inputBaseClasses } from '@mui/material/InputBase';

import { IKanbanTask } from 'src/types/kanban';
import moment from 'moment';

// ----------------------------------------------------------------------

type Props = {
  status: string;
  onCloseAddTask: VoidFunction;
  onAddTask: (task: IKanbanTask) => void;
  reporter: string;
};

export default function KanbanTaskAdd({ status, onAddTask, onCloseAddTask, reporter }: Props) {
  const [name, setName] = useState('');

  const defaultTask = useMemo(
    () => ({
      id: '', // Will be assigned by backend
      status: String(status), // Convert to string to match interface
      title: name.trim(),
      priority: "MEDIUM",
      attachments: [],
      labels: [],
      comments: [],
      assignee: null,
      due_date: moment(new Date()).format('YYYY-MM-DD'),
      description: '',
      reporter: String(reporter), // Convert to string to match interface
    }),
    [name, status, reporter]
  );

  const handleKeyUpAddTask = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        if (name.trim() && reporter) {
          onAddTask(defaultTask);
          setName('');
        }
      }
    },
    [defaultTask, name, onAddTask, reporter]
  );

  const handleClickAddTask = useCallback(() => {
    if (name.trim() && reporter) {
      onAddTask(defaultTask);
      setName('');
    } else {
      onCloseAddTask();
    }
  }, [defaultTask, name, onAddTask, onCloseAddTask, reporter]);

  const handleChangeName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
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
          placeholder="Taaknaam"
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
