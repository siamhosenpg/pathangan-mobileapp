import {
  followApi,
  useCheckIsFollowingQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "@/redux/api/followApi";
import { useAppSelector } from "@/redux/hooks";
import { useCallback, useRef } from "react";
import { useDispatch } from "react-redux";

export const useFollowState = (targetUserId: string) => {
  const dispatch = useDispatch<any>();
  const currentUser = useAppSelector((state) => state.auth.user);
  const inFlight = useRef(false);

  const isLoggedIn = !!currentUser;

  const { data, isLoading } = useCheckIsFollowingQuery(targetUserId, {
    skip: !targetUserId || !isLoggedIn,
  });

  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();

  // success বা error দুই ক্ষেত্রেই ready, যাতে UI আটকে না থাকে
  const isReady = !isLoading;
  const isFollowing = data?.isFollowing ?? false;

  const toggle = useCallback(async () => {
    if (!isLoggedIn || !isReady || inFlight.current) return;

    inFlight.current = true;
    const wasFollowing = isFollowing;

    // Optimistic update: cache instantly patch
    const patch = dispatch(
      followApi.util.updateQueryData(
        "checkIsFollowing",
        targetUserId,
        (draft: any) => {
          draft.isFollowing = !wasFollowing;
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
    isLoggedIn,
    isReady,
    isFollowing,
    dispatch,
    targetUserId,
    followUser,
    unfollowUser,
  ]);

  return { isFollowing, isReady, toggle };
};
