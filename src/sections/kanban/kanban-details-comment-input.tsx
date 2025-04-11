import { useCallback, useState } from 'react';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import InputBase from '@mui/material/InputBase';

import { useAuthContext } from 'src/auth/hooks';
import { IKanbanTask } from 'src/types/kanban';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  task: IKanbanTask;
  handleAddComment: (taskId: string, commentData: { commenter: string; comment: string }) => void;
};

export default function KanbanDetailsCommentInput({ task, handleAddComment }: Props) {
  const { user } = useAuthContext();
  const [commentInput, setCommentInput] = useState('');

  const handleSaveComment = useCallback(() => {
    if (commentInput.trim() && user?.id) {
      handleAddComment(task.id, {
        commenter: user.id.toString(),
        comment: commentInput.trim()
      });
      setCommentInput('');
    }
  }, [commentInput, user?.id, task.id, handleAddComment]);

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey && commentInput.trim() && user?.id) {
      event.preventDefault();
      handleSaveComment();
    }
  };

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        py: 3,
        px: 2.5,
      }}
    >
      <Avatar src={user?.photoURL} alt={user?.displayName} sx={{
        width: 36,
        height: 36,
        border: (theme) => `solid 2px ${theme.palette.background.default}`,
        fontSize: "0.75rem"
      }}>
        {user?.displayName?.charAt(0).toUpperCase()}
      </Avatar>

      <Paper variant="outlined" sx={{ p: 1, flexGrow: 1, bgcolor: 'transparent' }}>
        <InputBase
          fullWidth
          multiline
          rows={2}
          placeholder="Type a message"
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{ px: 1 }}
        />

        <Stack direction="row" alignItems="center" justifyContent="flex-end">
          <Button
            variant="contained"
            onClick={handleSaveComment}
            disabled={!commentInput.trim() || !user?.id}
          >
            Comment
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
