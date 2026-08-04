export const characterGradient: Record<string, string> = {
  princely: 'linear-gradient(160deg, #1A1B3A 0%, #6B4E9E 100%)',
  childhood_friend: 'linear-gradient(160deg, #6B4E9E 0%, #E8B4B8 100%)',
  mysterious: 'linear-gradient(160deg, #0d0e24 0%, #1A1B3A 100%)',
  cheerful: 'linear-gradient(160deg, #E8B4B8 0%, #6B4E9E 100%)',
  onee_san: 'linear-gradient(160deg, #6B4E9E 0%, #1A1B3A 100%)',
  tsundere: 'linear-gradient(160deg, #E8B4B8 0%, #1A1B3A 100%)',
};

export const defaultCharacterGradient = 'linear-gradient(160deg, #1A1B3A 0%, #6B4E9E 100%)';

export function getCharacterInitial(name: string): string {
  return name.charAt(0);
}
