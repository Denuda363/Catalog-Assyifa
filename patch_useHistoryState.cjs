const fs = require('fs');
let code = fs.readFileSync('src/components/RoomControl.tsx', 'utf-8');
const search = `function useHistoryState<T>(initialState: T) {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const setState = (newState: T | ((prev: T) => T)) => {
    setHistory((prevHistory) => {
      const currentState = prevHistory[historyIndex];
      const nextState = typeof newState === 'function' ? (newState as any)(currentState) : newState;
      const newHistory = prevHistory.slice(0, historyIndex + 1);
      newHistory.push(nextState);
      return newHistory;
    });
    setHistoryIndex((prevIndex) => prevIndex + 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((prevIndex) => prevIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prevIndex) => prevIndex + 1);
    }
  };
  
  const reset = (state: T) => {
    setHistory([state]);
    setHistoryIndex(0);
  };

  return [history[historyIndex], setState, undo, redo, historyIndex > 0, historyIndex < history.length - 1, reset] as const;
}`;

const replacement = `function useHistoryState<T>(initialState: T) {
  const [histories, setHistories] = useState<Record<string, { history: T[], index: number }>>({});
  const [currentKey, setCurrentKey] = useState<string>('default');

  const history = histories[currentKey]?.history || [initialState];
  const historyIndex = histories[currentKey]?.index ?? 0;

  const setState = (newState: T | ((prev: T) => T)) => {
    setHistories((prevHistories) => {
      const currentHistoryObj = prevHistories[currentKey] || { history: [initialState], index: 0 };
      const currentHistory = currentHistoryObj.history;
      const currentIndex = currentHistoryObj.index;
      
      const currentState = currentHistory[currentIndex];
      const nextState = typeof newState === 'function' ? (newState as any)(currentState) : newState;
      
      const newHistory = currentHistory.slice(0, currentIndex + 1);
      newHistory.push(nextState);
      
      return {
        ...prevHistories,
        [currentKey]: { history: newHistory, index: newHistory.length - 1 }
      };
    });
  };

  const undo = () => {
    setHistories((prev) => {
      const currentObj = prev[currentKey];
      if (currentObj && currentObj.index > 0) {
        return { ...prev, [currentKey]: { ...currentObj, index: currentObj.index - 1 } };
      }
      return prev;
    });
  };

  const redo = () => {
    setHistories((prev) => {
      const currentObj = prev[currentKey];
      if (currentObj && currentObj.index < currentObj.history.length - 1) {
        return { ...prev, [currentKey]: { ...currentObj, index: currentObj.index + 1 } };
      }
      return prev;
    });
  };
  
  const reset = (state: T, key: string = 'default') => {
    setCurrentKey(key);
    setHistories((prev) => {
      if (!prev[key]) {
        return { ...prev, [key]: { history: [state], index: 0 } };
      }
      return prev;
    });
  };

  const forceReset = (state: T, key: string = 'default') => {
    setCurrentKey(key);
    setHistories((prev) => ({ ...prev, [key]: { history: [state], index: 0 } }));
  };

  return [history[historyIndex], setState, undo, redo, historyIndex > 0, historyIndex < history.length - 1, reset, forceReset] as const;
}`;

code = code.replace(search, replacement);
fs.writeFileSync('src/components/RoomControl.tsx', code);
console.log("Patched");
