import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { AVATARS, GameGoals } from '@/types/game';
import { Slider } from '@/components/ui/slider';

interface GameSetupProps {
  onStart: () => void;
}

export function GameSetup({ onStart }: GameSetupProps) {
  const { state, dispatch } = useGame();
  const [step, setStep] = useState<'intro' | 'players' | 'goals'>('intro');
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [goals, setGoals] = useState<GameGoals>({
    wealth: 1000,
    happiness: 100,
    education: 100,
    career: 100,
  });
  const [playWithJones, setPlayWithJones] = useState(false);

  const handleAddPlayer = () => {
    if (playerName.trim() && selectedAvatar) {
      dispatch({ type: 'ADD_PLAYER', name: playerName.trim(), avatar: selectedAvatar });
      setPlayerName('');
      setSelectedAvatar('');
    }
  };

  const handleStartGame = () => {
    if (playWithJones && state.players.length < 2) {
      dispatch({ type: 'ADD_PLAYER', name: 'Jones', avatar: '🧔' });
    }
    dispatch({ type: 'START_GAME', goals });
    onStart();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-2xl retro-screen rounded-lg p-8 scanlines"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div
              key="intro"
              className="text-center space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="space-y-4">
                <motion.h1
                  className="font-pixel text-2xl md:text-3xl text-primary title-text vhs-glow"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  JONES IN THE
                </motion.h1>
                <motion.h1
                  className="font-pixel text-3xl md:text-4xl text-accent title-text"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.1 }}
                >
                  FAST LANE
                </motion.h1>
              </div>

              <p className="game-text text-xl text-muted-foreground max-w-md mx-auto">
                Climb the ladder of success! Manage your time, earn money,
                get educated, and find happiness before your rivals do.
              </p>

              <div className="flex flex-col gap-4 items-center pt-4">
                <Button
                  size="lg"
                  className="pixel-button text-lg px-8 py-6 bg-primary hover:bg-primary/90"
                  onClick={() => setStep('players')}
                >
                  START GAME
                </Button>

                <p className="game-text text-muted-foreground text-sm">
                  A Sierra On-Line Classic • Remake by Lovable
                </p>
              </div>
            </motion.div>
          )}

          {step === 'players' && (
            <motion.div
              key="players"
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="font-pixel text-xl text-primary text-center">
                SELECT PLAYERS
              </h2>

              {/* Current players */}
              {state.players.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h3 className="font-pixel text-xs text-muted-foreground">Players:</h3>
                  <div className="flex flex-wrap gap-2">
                    {state.players.map(p => (
                      <div
                        key={p.id}
                        className="bg-card rounded px-3 py-2 flex items-center gap-2"
                      >
                        <span className="text-xl">{p.avatar}</span>
                        <span className="game-text">{p.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add player form */}
              {state.players.length < 4 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="font-pixel text-xs text-muted-foreground">
                      Player Name
                    </label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      className="w-full bg-input border border-border rounded px-4 py-3 game-text text-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter your name..."
                      maxLength={12}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-pixel text-xs text-muted-foreground">
                      Choose Avatar
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {AVATARS.filter(a => a.id !== 'jones').map(avatar => (
                        <motion.button
                          key={avatar.id}
                          className={`aspect-square rounded-lg border-2 flex items-center justify-center text-3xl transition-colors ${
                            selectedAvatar === avatar.emoji
                              ? 'border-primary bg-primary/20'
                              : 'border-border bg-card hover:border-muted-foreground'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedAvatar(avatar.emoji)}
                        >
                          {avatar.emoji}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="pixel-button w-full"
                    onClick={handleAddPlayer}
                    disabled={!playerName.trim() || !selectedAvatar}
                  >
                    ADD PLAYER
                  </Button>
                </div>
              )}

              {/* Play with Jones toggle */}
              <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🧔</span>
                  <div>
                    <p className="game-text">Play against Jones?</p>
                    <p className="text-muted-foreground text-sm">The AI competitor</p>
                  </div>
                </div>
                <Button
                  variant={playWithJones ? 'default' : 'outline'}
                  className="pixel-button"
                  onClick={() => setPlayWithJones(!playWithJones)}
                >
                  {playWithJones ? 'YES' : 'NO'}
                </Button>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  className="pixel-button flex-1"
                  onClick={() => setStep('intro')}
                >
                  BACK
                </Button>
                <Button
                  className="pixel-button flex-1"
                  onClick={() => setStep('goals')}
                  disabled={state.players.length === 0 && !playWithJones}
                >
                  SET GOALS
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'goals' && (
            <motion.div
              key="goals"
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="font-pixel text-xl text-primary text-center">
                SET YOUR GOALS
              </h2>

              <p className="game-text text-muted-foreground text-center">
                First player to reach all four goals wins!
              </p>

              <div className="space-y-6">
                {[
                  { key: 'wealth', label: '💰 Wealth', min: 500, max: 5000, step: 100 },
                  { key: 'happiness', label: '😊 Happiness', min: 50, max: 200, step: 10 },
                  { key: 'education', label: '📚 Education', min: 25, max: 125, step: 25 },
                  { key: 'career', label: '📈 Career', min: 20, max: 100, step: 20 },
                ].map(({ key, label, min, max, step }) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="game-text">{label}</span>
                      <span className="font-pixel text-xs text-primary">
                        {goals[key as keyof GameGoals]}
                      </span>
                    </div>
                    <Slider
                      value={[goals[key as keyof GameGoals]]}
                      onValueChange={([value]) =>
                        setGoals(prev => ({ ...prev, [key]: value }))
                      }
                      min={min}
                      max={max}
                      step={step}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  className="pixel-button flex-1"
                  onClick={() => setStep('players')}
                >
                  BACK
                </Button>
                <Button
                  className="pixel-button flex-1 bg-accent hover:bg-accent/90"
                  onClick={handleStartGame}
                >
                  START GAME!
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
