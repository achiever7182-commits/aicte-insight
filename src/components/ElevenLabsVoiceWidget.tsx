import { useEffect } from "react";

// ElevenLabs custom element declaration for TypeScript JSX
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "elevenlabs-convai": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          "agent-id": string;
          "avatar-orb-color-1"?: string;
          "avatar-orb-color-2"?: string;
          "action-text"?: string;
          "start-call-text"?: string;
          "end-call-text"?: string;
          "expand-text"?: string;
          "collapse-text"?: string;
        },
        HTMLElement
      >;
    }
  }
}

const SCRIPT_SRC = "https://elevenlabs.io/convai-widget/index.js";
const AGENT_ID = "agent_6701m5h42hhge80akeb7w1fy2p4a";

export function ElevenLabsVoiceWidget() {
  useEffect(() => {
    // Only inject script in browser environment
    if (typeof window === "undefined") return;

    // Check if script already exists
    const existingScript = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.type = "text/javascript";
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="elevenlabs-widget-wrapper" aria-label="AICTE Voice Copilot Widget">
      <elevenlabs-convai
        agent-id={AGENT_ID}
        avatar-orb-color-1="#FF9933"
        avatar-orb-color-2="#F5C542"
        action-text="AICTE Voice Copilot"
        start-call-text="Start Voice Session"
        end-call-text="End Call"
      />
    </div>
  );
}
