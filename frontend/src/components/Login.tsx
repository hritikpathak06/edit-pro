import { BASE_URL } from "../config";

function Login() {
  const login = () => {
    window.open(`${BASE_URL}/auth/google`, "_self");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 to-blue-100">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-6 py-12 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight">
                Edit Documents <span className="text-indigo-600">Smarter</span>,
                Not Harder
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum
                itaque dolore consequuntur sint aspernatur? Nihil error harum
                adipisci eligendi hic modi veritatis ullam consequatur sint
                iure. Dolor, doloremque quo! Doloremque eius asperiores dicta
                quibusdam omnis ducimus aspernatur cum accusantium consectetur?
              </p>
              <button
                className=" bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300 text-lg font-medium shadow-lg flex items-center space-x-2"
                onClick={() =>
                  alert("Google Sign-in would be implemented here")
                }
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span onClick={login}>Get Started with Google</span>
              </button>
            </div>
            <div className="md:w-1/2 md:pl-10">
              <img
                src="https://images.unsplash.com/photo-1600267204091-5c1ab8b10c02?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Document editing illustration"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
