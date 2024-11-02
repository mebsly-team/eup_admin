import { useCallback, useState } from 'react';
import { Paper, Stack, Button, Avatar, InputBase, IconButton } from '@mui/material';
import { IKanbanComment } from 'src/types/kanban';

import { useAuthContext } from 'src/auth/hooks';

import Iconify from 'src/components/iconify';
import { useTranslate } from 'src/locales';

// ----------------------------------------------------------------------

type Props = {
  onAddComment: (comment: IKanbanComment) => void;
};

export default function KanbanDetailsCommentInput({ onAddComment }: Props) {
  const { t } = useTranslate();
  const { user } = useAuthContext();
  const [message, setMessage] = useState('');

  const handleChangeMessage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!message.trim()) return;

    const newComment: IKanbanComment = {
      id: `comment-${Date.now()}`,
      message: message.trim(),
      messageType: 'text',
      createdAt: new Date(),
      name: user?.displayName || '',
      avatarUrl: user?.photoURL || '',
    };

    const existingComments = localStorage.getItem('kanbanComments');
    const commentsArray = existingComments ? JSON.parse(existingComments) : [];
    commentsArray.push(newComment);
    localStorage.setItem('kanbanComments', JSON.stringify(commentsArray));

    onAddComment(newComment);
    setMessage('');
  }, [message, onAddComment, user]);

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        py: 3,
        px: 2.5,
      }}
    >
      <Avatar src={user?.photoURL} alt={user?.displayName}>
        {user?.displayName?.charAt(0).toUpperCase()}
      </Avatar>

      <Paper variant="outlined" sx={{ p: 1, flexGrow: 1, bgcolor: 'transparent' }}>
        <InputBase
          fullWidth
          multiline
          rows={2}
          placeholder="Type a message"
          sx={{ px: 1 }}
          onChange={handleChangeMessage}
        />

        <Stack direction="row" alignItems="center">
          <Stack direction="row" flexGrow={1}>
            <IconButton>
              <Iconify icon="solar:gallery-add-bold" />
            </IconButton>

            <IconButton>
              <Iconify icon="eva:attach-2-fill" />
            </IconButton>
          </Stack>

          <Button variant="contained" onClick={handleSubmit}>
            {t('comment')}
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
