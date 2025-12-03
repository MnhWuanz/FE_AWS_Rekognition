import studentApi from '../../../api/apiUser/StudentAPI';

export const checkMSSV = async (mssv) => {
  const res = await studentApi.getAll();

  const list = res.data.data;

  const student = list.find((s) => s.code === mssv);
  if (student && student.faceId !== null && student.faceId !== '') {
    return true;
  }
  return false;
};
export const checkSV = async (mssv) => {
  const res = await studentApi.getAll();
  const list = res.data.data;
  const student = list.find((s) => s.code === mssv);
  console.log(student);
  return student ? student.id : 0;
};
