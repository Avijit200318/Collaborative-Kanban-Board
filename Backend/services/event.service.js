const clients = new Set();

export const addEventClient = (res) => {
    clients.add(res);
};

export const removeEventClient = (res) => {
    clients.delete(res);
};

export const broadcastBoardEvent = (type, payload, sourceClientId = null) => {
    const eventData = JSON.stringify({
        type,
        sourceClientId,
        ...payload,
    });

    const message = `event: board-update\ndata: ${eventData}\n\n`;

    for (const client of clients) {
        try {
            client.write(message);
        } catch {
            clients.delete(client);
        }
    }
};
