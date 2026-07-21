import type { Challenge, Lesson } from '../curriculum'

export interface LessonRun {
  currentChallenge(): Challenge | undefined
  position(): { current: number; total: number }
  isComplete(): boolean
  retry(): Challenge | undefined
  advance(): Challenge | undefined
}

export function createLessonRun(
  lesson: Lesson,
  random: () => number = Math.random,
): LessonRun {
  const order = [...lesson.challengePool]
  for (let index = order.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    ;[order[index], order[target]] = [order[target], order[index]]
  }
  let index = 0

  return {
    currentChallenge: () => order[index],
    position: () => ({ current: Math.min(index + 1, order.length), total: order.length }),
    isComplete: () => index >= order.length,
    retry: () => order[index],
    advance: () => {
      if (index < order.length) index += 1
      return order[index]
    },
  }
}
