import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../redux/store";
import {
  applyRemoteEvent,
  BoardStreamEvent,
  setLiveConnected,
} from "../redux/board/boardSlice";

type EventConnectProps = {
  activeDragId: string | null;
};

export default function EventConnect({ activeDragId }: EventConnectProps) {
  const dispatch = useDispatch<AppDispatch>();
  const activeDragIdRef = useRef<string | null>(activeDragId);

  useEffect(() => {
    activeDragIdRef.current = activeDragId;
  }, [activeDragId]);

  useEffect(() => {
    const eventSource = new EventSource("/api/events");

    const handleConnected = () => {
      dispatch(setLiveConnected(true));
    };

    const handleBoardUpdate = (e: MessageEvent<string>) => {
      try {
        const parsed = JSON.parse(e.data) as BoardStreamEvent;
        dispatch(
          applyRemoteEvent({
            event: parsed,
            activeDragId: activeDragIdRef.current,
          })
        );
      } catch {
        // Ignore malformed SSE payload
      }
    };

    const handleError = () => {
      dispatch(setLiveConnected(false));
    };

    eventSource.addEventListener("connected", handleConnected);
    eventSource.addEventListener("board-update", handleBoardUpdate);
    eventSource.addEventListener("error", handleError);

    return () => {
      eventSource.removeEventListener("connected", handleConnected);
      eventSource.removeEventListener("board-update", handleBoardUpdate);
      eventSource.removeEventListener("error", handleError);
      eventSource.close();
      dispatch(setLiveConnected(false));
    };
  }, [dispatch]);

  return null;
}
