import type { Address } from "viem";
import { DAILY_GM_ADDRESSES } from "@/lib/constants";
import { getChainBtnClasses, isSponsoredOnChain } from "@/lib/utils";

type UseModalRendererLogicProps = {
  activeModalChainId: number | null;
  chains: Array<{ id: number; name: string }>;
  sponsored: boolean;
};

type ModalRendererResult =
  | {
      shouldRender: false;
      activeChain: null;
      activeContractAddress: null;
      chainBtnClasses: "";
      isSponsored: false;
    }
  | {
      shouldRender: true;
      activeChain: { id: number; name: string };
      activeContractAddress: Address;
      chainBtnClasses: string;
      isSponsored: boolean;
    };

export function useModalRendererLogic({
  activeModalChainId,
  chains,
  sponsored,
}: UseModalRendererLogicProps): ModalRendererResult {
  if (!activeModalChainId) {
    return {
      shouldRender: false,
      activeChain: null,
      activeContractAddress: null,
      chainBtnClasses: "",
      isSponsored: false,
    };
  }

  const activeChain = chains.find((c) => c.id === activeModalChainId);
  if (!activeChain) {
    return {
      shouldRender: false,
      activeChain: null,
      activeContractAddress: null,
      chainBtnClasses: "",
      isSponsored: false,
    };
  }

  const activeContractAddress = DAILY_GM_ADDRESSES[activeChain.id];
  if (!activeContractAddress) {
    return {
      shouldRender: false,
      activeChain: null,
      activeContractAddress: null,
      chainBtnClasses: "",
      isSponsored: false,
    };
  }

  return {
    shouldRender: true,
    activeChain,
    activeContractAddress,
    chainBtnClasses: getChainBtnClasses(activeModalChainId),
    isSponsored: isSponsoredOnChain(sponsored, activeModalChainId),
  };
}
