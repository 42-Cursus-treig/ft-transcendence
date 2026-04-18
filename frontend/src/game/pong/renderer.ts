import { GAME_WIDTH, GAME_HEIGHT } from './constants';
import type { GameState, PowerUp } from './types';
import { THEMES } from './themes';
import type { Theme } from './settings';

export function render(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  theme: Theme = 'CLASSIC',
  aliases?: { left: string; right: string },
): void {
  const colors = THEMES[theme];

  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(GAME_WIDTH / 2, 0);
  ctx.lineTo(GAME_WIDTH / 2, GAME_HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]);

  drawScore(ctx, state.score.left, state.score.right, colors, aliases);

  if (state.powerUp && state.status !== 'finished') {
    drawPowerUp(ctx, state.powerUp, colors);
  }

  const leftHasBig = state.activePowerUps.some((p) => p.side === 'left');
  const rightHasBig = state.activePowerUps.some((p) => p.side === 'right');
  drawPaddle(ctx, state.leftPaddle, colors, leftHasBig);
  drawPaddle(ctx, state.rightPaddle, colors, rightHasBig);

  if (state.status !== 'finished') {
    drawBall(ctx, state.ball.x, state.ball.y, state.ball.size, colors);
  }

  if (state.status === 'idle') {
    drawOverlay(ctx, colors, 'PRESS SPACE TO START');
  } else if (state.status === 'paused') {
    drawOverlay(ctx, colors, 'PAUSED');
  } else if (state.status === 'finished' && state.winner) {
    const winnerName = aliases
      ? (state.winner === 'left' ? aliases.left : aliases.right)
      : (state.winner === 'left' ? 'LEFT PLAYER' : 'RIGHT PLAYER');
    drawOverlay(ctx, colors, `${winnerName.toUpperCase()} WINS`, 'PRESS SPACE TO PLAY AGAIN');
  }
}

function drawPaddle(
  ctx: CanvasRenderingContext2D,
  paddle: GameState['leftPaddle'],
  colors: typeof THEMES.CLASSIC,
  boosted: boolean,
): void {
  ctx.shadowColor = colors.glow;
  ctx.shadowBlur = boosted ? 30 : 15;
  ctx.fillStyle = boosted ? colors.accent : colors.fg;
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  ctx.shadowBlur = 0;
}

function drawBall(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  colors: typeof THEMES.CLASSIC,
): void {
  ctx.shadowColor = colors.glow;
  ctx.shadowBlur = 20;
  ctx.fillStyle = colors.fg;
  ctx.fillRect(x - size / 2, y - size / 2, size, size);
  ctx.shadowBlur = 0;
}

function drawPowerUp(
  ctx: CanvasRenderingContext2D,
  pu: PowerUp,
  colors: typeof THEMES.CLASSIC,
): void {
  const t = performance.now() / 300;
  const scale = 1 + Math.sin(t) * 0.1;
  const size = pu.size * scale;

  ctx.shadowColor = colors.accent;
  ctx.shadowBlur = 25;
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 3;
  ctx.strokeRect(pu.x - size / 2, pu.y - size / 2, size, size);

  ctx.shadowBlur = 0;
  ctx.fillStyle = colors.accent;
  ctx.font = 'bold 14px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('P', pu.x, pu.y);
}

function drawScore(
  ctx: CanvasRenderingContext2D,
  left: number, right: number,
  colors: typeof THEMES.CLASSIC,
  aliases?: { left: string; right: string },
): void {
  ctx.fillStyle = colors.fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.shadowColor = colors.glow;
  ctx.shadowBlur = 10;

  if (aliases) {
    ctx.font = 'bold 14px "Press Start 2P", monospace';
    ctx.fillText(aliases.left.toUpperCase().slice(0, 12), GAME_WIDTH / 4, 20);
    ctx.fillText(aliases.right.toUpperCase().slice(0, 12), (GAME_WIDTH * 3) / 4, 20);
  }

  ctx.font = 'bold 60px "Press Start 2P", monospace';
  ctx.fillText(String(left), GAME_WIDTH / 4, 50);
  ctx.fillText(String(right), (GAME_WIDTH * 3) / 4, 50);
  ctx.shadowBlur = 0;
}

function drawOverlay(
  ctx: CanvasRenderingContext2D,
  colors: typeof THEMES.CLASSIC,
  mainText: string, subText?: string,
): void {
  ctx.fillStyle = `${colors.bg}cc`;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  ctx.fillStyle = colors.overlayText;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = colors.glow;
  ctx.shadowBlur = 15;

  ctx.font = 'bold 24px "Press Start 2P", monospace';
  ctx.fillText(mainText, GAME_WIDTH / 2, GAME_HEIGHT / 2);

  if (subText) {
    ctx.font = 'bold 12px "Press Start 2P", monospace';
    ctx.fillText(subText, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50);
  }
  ctx.shadowBlur = 0;
}