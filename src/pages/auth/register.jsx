// import React from 'react';
// import RegisterForm from '../../components/Auth/RegisterForm';

// function RegisterPage() {
//   return (
//     <div>
//       <RegisterForm />
//     </div>
//   );
// }

// export default RegisterPage;

import React from 'react';
import RegisterForm from '../../components/Auth/RegisterForm';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
       <Link to="/" style={{ position: 'absolute', top: '20px', left: '20px', color: '#075E54', textDecoration: 'none', fontWeight: 'bold' }}>
        &larr; Back to Home
      </Link>
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;