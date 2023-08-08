import User from '../../models/userModel';

type AssignOffice = (a: { userId: string; projId: string }) => Promise<void>;
type AssignEngineer = (a: string, b: { userId: string; projId: string }) => Promise<void>;

export const assignProjectAtsakingas: AssignOffice = async ({ userId, projId }) => {
  const user = await User.findById(userId);

  if (user) {
    const idx = user.projects.atsakingas.findIndex((el) => el.project.toString() === projId.toString());
    if (idx === -1) {
      user.projects.atsakingas.push({ project: projId });
      await user.save();
    }
  }
};

export const unassignProjectAtsakingas: AssignOffice = async ({ userId, projId }) => {
  const user = await User.findById(userId);

  if (user) {
    const idx = user.projects.atsakingas.findIndex((el) => el.project.toString() === projId.toString());

    if (idx !== -1) {
      user.projects.atsakingas.splice(idx, 1);
      await user.save();
    }
  }
};

// DIRBA

export const assignProjectDirba: AssignOffice = async ({ userId, projId }) => {
  const user = await User.findById(userId);

  if (user) {
    const idx = user.projects.dirba.findIndex((el) => el.project.toString() === projId.toString());
    if (idx === -1) {
      user.projects.dirba.push({ project: projId });
      await user.save();
    }
  }
};

export const unassignProjectDirba: AssignOffice = async ({ userId, projId }) => {
  const user = await User.findById(userId);

  if (user) {
    const idx = user.projects.dirba.findIndex((el) => el.project.toString() === projId.toString());

    if (idx !== -1) {
      user.projects.dirba.splice(idx, 1);
      await user.save();
    }
  }
};

// ENGINEER

export const assignProjectEngineer: AssignEngineer = async (dalis, { userId, projId }) => {
  const user = await User.findById(userId);

  if (user) {
    const idx = user.projects.engineer.findIndex(
      (el) => el.project.toString() === projId.toString() && el.dalis === dalis
    );
    if (idx === -1) {
      user.projects.engineer.push({ dalis: dalis, project: projId });
      await user.save();
    }
  }
};

export const unAssignProjectEngineer: AssignEngineer = async (dalis, { userId, projId }) => {
  const user = await User.findById(userId);

  if (user) {
    const idx = user?.projects.engineer.findIndex(
      (el) => el.project.toString() === projId.toString() && el.dalis === dalis
    );

    if (idx !== -1) {
      user.projects.engineer.splice(idx, 1);
      await user.save();
    }
  }
};
