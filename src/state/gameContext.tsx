import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CameraSettings, calculateEV, exposureDelta, scoreShot } from "../services/gameEngine";
import { levels } from "../services/levels";
import { generateScene, magicEdit, remixPrompt } from "../services/genAIService";

const defaultSettings: CameraSettings = {
  iso: 200,
  aperture: 2.8,
  shutterSpeed: 1 / 250,
};

type GameContextValue = {
  settings: CameraSettings;
  levelIndex: number;
  currentLevel: typeof levels[number];
  ev: number;
  delta: number;
  score: number | null;
  imageUrl: string;
  prompt: string;
  isLoading: boolean;
  setISO: (value: number) => void;
  setAperture: (value: number) => void;
  setShutter: (value: number) => void;
  shoot: () => void;
  clearScore: () => void;
  nextLevel: () => void;
  remixScene: () => Promise<void>;
  applyMagicEdit: (edit: string) => Promise<void>;
};

const GameContext = createContext<GameContextValue | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [levelIndex, setLevelIndex] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [prompt, setPrompt] = useState(levels[0].prompt);
  const [isLoading, setIsLoading] = useState(false);

  const currentLevel = levels[levelIndex];
  const ev = useMemo(() => calculateEV(settings), [settings]);
  const delta = useMemo(() => exposureDelta(settings, currentLevel.targetEV), [settings, currentLevel]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const { imageUrl: url, prompt: usedPrompt } = await generateScene(currentLevel.prompt);
      setImageUrl(url);
      setPrompt(usedPrompt);
      setIsLoading(false);
    };

    load();
  }, [currentLevel]);

  const setISO = (value: number) => setSettings((prev) => ({ ...prev, iso: value }));
  const setAperture = (value: number) => setSettings((prev) => ({ ...prev, aperture: value }));
  const setShutter = (value: number) => setSettings((prev) => ({ ...prev, shutterSpeed: value }));

  const shoot = () => {
    setScore(scoreShot(delta));
  };

  const clearScore = () => setScore(null);

  const nextLevel = () => {
    setScore(null);
    setLevelIndex((prev) => (prev + 1) % levels.length);
  };

  const remixScene = async () => {
    setIsLoading(true);
    const newPrompt = await remixPrompt(prompt);
    const { imageUrl: url } = await generateScene(newPrompt);
    setPrompt(newPrompt);
    setImageUrl(url);
    setIsLoading(false);
  };

  const applyMagicEdit = async (edit: string) => {
    setIsLoading(true);
    const newPrompt = await magicEdit(prompt, edit);
    const { imageUrl: url } = await generateScene(newPrompt);
    setPrompt(newPrompt);
    setImageUrl(url);
    setIsLoading(false);
  };

  const value = useMemo(
    () => ({
      settings,
      levelIndex,
      currentLevel,
      ev,
      delta,
      score,
      imageUrl,
      prompt,
      isLoading,
      setISO,
      setAperture,
      setShutter,
      shoot,
      clearScore,
      nextLevel,
      remixScene,
      applyMagicEdit,
    }),
    [
      settings,
      levelIndex,
      currentLevel,
      ev,
      delta,
      score,
      imageUrl,
      prompt,
      isLoading,
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within GameProvider");
  }
  return context;
};
