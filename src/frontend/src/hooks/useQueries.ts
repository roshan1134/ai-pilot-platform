import { useQuery } from "@tanstack/react-query";
import type { FlightSession } from "../backend";
import { useActor } from "./useActor";

export function useCurrentSession() {
  const { actor, isFetching } = useActor();
  return useQuery<FlightSession | null>({
    queryKey: ["currentSession"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCurrentSession();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}
