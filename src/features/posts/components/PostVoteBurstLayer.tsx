import {
  LikeHeartBurst,
  type VoteBurstDirection,
} from "@/components/LikeHeartBurst";
import {
  forwardRef,
  memo,
  useImperativeHandle,
  useState,
} from "react";

export type PostVoteBurstHandle = {
  trigger: (direction: VoteBurstDirection) => void;
};

export const PostVoteBurstLayer = memo(
  forwardRef<PostVoteBurstHandle>(function PostVoteBurstLayer(_props, ref) {
    const [burstKey, setBurstKey] = useState(0);
    const [direction, setDirection] = useState<VoteBurstDirection>("up");

    useImperativeHandle(
      ref,
      () => ({
        trigger(nextDirection) {
          setDirection(nextDirection);
          setBurstKey((key) => key + 1);
        },
      }),
      []
    );

    return <LikeHeartBurst burstKey={burstKey} direction={direction} />;
  })
);
