import User from '../models/userModel';
import Project from '../models/projectModel';

const migrationFix = async () => {
  // const users = await User.find({});
  // const projects = await Project.find({});
  // for (let el of users) {
  //   el.papildomiDarbai = {
  //     valandinis: 0,
  //     darbai: []
  //   };
  //   el.payments = {
  //     papildomiDarbai: [],
  //     atsakingas: [],
  //     dirba: [],
  //     engineer: []
  //   };
  //   await el.save();
  // }
  // for (let el of projects) {
  //   el.timeline = [];
  //   await el.save();
  // }
  // console.log('---Migrations run---');
  // console.log(`Users: ${users.length}`);
  // console.log(`Projects: ${projects.length}`);
};

export default migrationFix;
