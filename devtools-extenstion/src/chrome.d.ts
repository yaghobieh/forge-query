/**
 * Chrome DevTools Extension API types
 */

declare namespace chrome {
  namespace devtools {
    namespace panels {
      function create(
        title: string,
        iconPath: string,
        pagePath: string,
        callback?: (panel: ExtensionPanel) => void
      ): void;

      interface ExtensionPanel {
        onShown: Event<(window: Window) => void>;
        onHidden: Event<() => void>;
      }
    }

    namespace inspectedWindow {
      const tabId: number;
      
      function eval<T = unknown>(
        expression: string,
        callback?: (result: T, exceptionInfo: EvalExceptionInfo) => void
      ): void;

      interface EvalExceptionInfo {
        isError?: boolean;
        code?: string;
        description?: string;
        details?: unknown[];
        isException?: boolean;
        value?: string;
      }
    }
  }

  namespace runtime {
    interface Port {
      name: string;
      sender?: MessageSender;
      disconnect(): void;
      postMessage(message: unknown): void;
      onMessage: Event<(message: unknown, port: Port) => void>;
      onDisconnect: Event<(port: Port) => void>;
    }

    interface MessageSender {
      tab?: tabs.Tab;
      frameId?: number;
      id?: string;
      url?: string;
      origin?: string;
    }

    function connect(connectInfo?: { name?: string }): Port;
    function sendMessage(message: unknown): void;
    
    const onConnect: Event<(port: Port) => void>;
    const onMessage: Event<(message: unknown, sender: MessageSender, sendResponse: (response?: unknown) => void) => boolean | void>;
  }

  namespace tabs {
    interface Tab {
      id?: number;
      url?: string;
      title?: string;
    }

    function sendMessage(tabId: number, message: unknown): void;
  }

  interface Event<T extends (...args: unknown[]) => unknown> {
    addListener(callback: T): void;
    removeListener(callback: T): void;
    hasListener(callback: T): boolean;
  }
}

