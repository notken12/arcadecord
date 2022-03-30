// threadUpdate.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

export default {
  name: 'threadUpdate',
  async execute(oldThread, newThread) {
    if (!oldThread.archived && newThread.archived) {
      // Thread was archived
      // Check if it's an Arcadecord thread and if it is, unarchive it
      if (
        await oldThread.members.fetch(oldThread.client.user.id).catch(() => {})
      ) {
        newThread.setArchived(false)
      }
    }
  },
}
