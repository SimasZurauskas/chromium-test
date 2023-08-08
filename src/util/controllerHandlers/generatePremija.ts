import moment from 'moment';

interface Premija {
  suma: number;
  ivykdzius: number;
  isEligible?: boolean | undefined;
  isPaid?: boolean | undefined;
}

type GeneratePremija = (a: { pabaiga: string; progress: number; existing?: Premija; incoming?: Premija }) => Premija;

export const generatePremija: GeneratePremija = ({ pabaiga, progress, existing, incoming }) => {
  if (!incoming) {
    incoming = { suma: 0, ivykdzius: 0 };
  }

  if (existing?.isPaid || !pabaiga || existing?.isEligible) {
    return { ...existing, suma: incoming.suma, ivykdzius: incoming.ivykdzius };
  }

  const dif = moment(pabaiga).diff(new Date(), 'days');

  if (dif >= 0 && Boolean(incoming.ivykdzius) && progress >= incoming.ivykdzius) {
    return {
      ...existing,
      suma: incoming.suma,
      ivykdzius: incoming.ivykdzius,
      isEligible: true,
      achievedDate: moment(new Date()).toISOString()
    };
  } else {
    return { ...existing, suma: incoming.suma, ivykdzius: incoming.ivykdzius };
  }
};
