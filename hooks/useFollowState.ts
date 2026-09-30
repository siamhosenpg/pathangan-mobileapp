import {
  followApi,
  useFollowUserMutation,
  useGetFollowersQuery,
  useUnfollowUserMutation,
} from "@/redux/api/followApi";
import { useAppSelector } from "@/redux/hooks";
import { useCallback, useRef } from "react";
import { useDispatch } from "react-redux";

// followerId can be a populated object or a plain id string
const extractId = (value: any): string | undefined =>
  value && typeof value === "object" ? (value._id ?? value.id) : value;

export const useFollowState = (targetUserId: string) => {
  const dispatch = useDispatch<any>();
  const currentUser = useAppSelector((state) => state.auth.user);
  const inFlight = useRef(false);

  const myIds = [(currentUser as any)?.id, (currentUser as any)?._id].filter(
    Boolean,
  ) as string[];

  const { data, isLoading } = useGetFollowersQuery(targetUserId, {
    skip: !targetUserId,
  });

  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();

  const isReady = !isLoading && !!data;

  const isFollowing = (data?.followers ?? []).some((f: any) =>
    myIds.includes(extractId(f.followerId) as string),
  );

  const toggle = useCallback(async () => {
    if (!myIds.length || !isReady || inFlight.current) return;

    inFlight.current = true;
    const wasFollowing = isFollowing;

    // Optimistic update: patch the cache instantly
    const patch = dispatch(
      followApi.util.updateQueryData(
        "getFollowers",
        targetUserId,
        (draft: any) => {
          if (!Array.isArray(draft.followers)) return;
          if (wasFollowing) {
            draft.followers = draft.followers.filter(
              (f: any) => !myIds.includes(extractId(f.followerId) as string),
            );
          } else {
            draft.followers.push({ followerId: myIds[0] });
          }
        },
      ),
    );

    try {
      if (wasFollowing) {
        await unfollowUser(targetUserId).unwrap();
      } else {
        await followUser(targetUserId).unwrap();
      }
    } catch (err) {
      patch.undo(); // rollback
      throw err;
    } finally {
      inFlight.current = false;
    }
  }, [
    myIds,
    isReady,
    isFollowing,
    dispatch,
    targetUserId,
    followUser,
    unfollowUser,
  ]);

  return { isFollowing, isReady, toggle };
};
