import expressAsyncHandler from 'express-async-handler';
import Project, { MProject } from '../../models/projectModel';

// @route GET /api/project/engineer
// @access Private
export const getProjectsEng = expressAsyncHandler(async (req, res) => {
  // @ts-ignore
  const userId = req.userId as string;

  try {
    const projects = (await Project.find({ 'dalys.user': userId })
      .populate('atsakingas.user', 'userName')
      .populate('dirba.user', 'userName')
      .populate('dalys.user')
      .populate('pastabos.user', 'userName')
      .sort({ createdAt: -1 })) as MProject[];

    const mapped = projects.map((el) => {
      const latestDate = el.pastabos[el.pastabos.length - 1] ? el.pastabos[el.pastabos.length - 1].date : undefined;

      return {
        ...el.toObject(),
        pastabos: { pastabos: el.pastabos, latestDate },
        subrangovai: el.dalys.map((el) => {
          return {
            isComplete: el.aktuotaProc >= 100,
            dalis: el.dalis,
            // @ts-ignore
            userName: el.user.userName
          };
        })
      };
    });

    res.status(200).json({ data: mapped });
  } catch (error: any) {
    res.status(500);
    throw new Error(error.message);
  }
});
