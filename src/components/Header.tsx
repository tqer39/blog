import { FC } from 'react';

const Header: FC = () => {
  return (
    <div className="bg-white lg:pb-12">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
        <header className="flex items-center justify-between py-4 md:py-8">
          <a
            href="/"
            className="text-black-800 inline-flex items-center gap-2.5 text-2xl font-bold md:text-3xl"
            aria-label="logo"
          >
            Flowrift
          </a>
          <nav className="hidden gap-12 lg:flex">
            <a
              href="#"
              className="text-lg font-semibold text-gray-600 transition duration-100 hover:text-indigo-500 active:text-indigo-700"
            >
              Home
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-1 text-lg font-semibold text-indigo-500"
            >
              Features
            </a>
            <a
              href="#"
              className="text-lg font-semibold text-gray-600 transition duration-100 hover:text-indigo-500 active:text-indigo-700"
            >
              Pricing
            </a>
            <a
              href="#"
              className="text-lg font-semibold text-gray-600 transition duration-100 hover:text-indigo-500 active:text-indigo-700"
            >
              About
            </a>
          </nav>
          <div className="-ml-8 hidden flex-col gap-2.5 sm:flex-row sm:justify-center lg:flex lg:justify-start">
            <a
              href="#"
              className="inline-block rounded-lg px-4 py-3 text-center text-sm font-semibold text-gray-500 outline-none ring-indigo-300 transition duration-100 hover:text-indigo-500 focus-visible:ring active:text-indigo-600 md:text-base"
            >
              Sign in
            </a>
            <a
              href="#"
              className="inline-block rounded-lg bg-indigo-500 px-8 py-3 text-center text-sm font-semibold text-white outline-none ring-indigo-300 transition duration-100 hover:bg-indigo-600 focus-visible:ring active:bg-indigo-700 md:text-base"
            >
              Sign up
            </a>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-gray-200 px-2.5 py-2 text-sm font-semibold text-gray-500 ring-indigo-300 hover:bg-gray-300 focus-visible:ring active:text-gray-700 md:text-base lg:hidden"
          >
            Menu
          </button>
        </header>
        <div className="hidden w-full overflow-hidden rounded-lg border bg-gray-50 shadow-sm lg:block">
          <div className="mx-auto flex max-w-screen-lg items-center gap-8 p-8">
            <div className="grid w-2/3 grid-cols-2 gap-8">
              <a href="#" className="group flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-lg transition duration-100 group-hover:bg-indigo-600 group-active:bg-indigo-700 md:h-12 md:w-12"></div>
                <div>
                  <div className="mb-1 font-semibold">Growth</div>
                  <p className="text-sm text-gray-500">
                    This is a section of some simple filler text, also known as
                    placeholder text.
                  </p>
                </div>
              </a>
              <a href="#" className="group flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-lg transition duration-100 group-hover:bg-indigo-600 group-active:bg-indigo-700 md:h-12 md:w-12"></div>
                <div>
                  <div className="mb-1 font-semibold">Security</div>
                  <p className="text-sm text-gray-500">
                    This is a section of some simple filler text, also known as
                    placeholder text.
                  </p>
                </div>
              </a>
              <a href="#" className="group flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-lg transition duration-100 group-hover:bg-indigo-600 group-active:bg-indigo-700 md:h-12 md:w-12"></div>
                <div>
                  <div className="mb-1 font-semibold">Cloud</div>
                  <p className="text-sm text-gray-500">
                    This is a section of some simple filler text, also known as
                    placeholder text.
                  </p>
                </div>
              </a>
              <a href="#" className="group flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-lg transition duration-100 group-hover:bg-indigo-600 group-active:bg-indigo-700 md:h-12 md:w-12"></div>
                <div>
                  <div className="mb-1 font-semibold">Analytics</div>
                  <p className="text-sm text-gray-500">
                    This is a section of some simple filler text, also known as
                    placeholder text.
                  </p>
                </div>
              </a>
            </div>

            <div className="w-1/3 overflow-hidden rounded-lg border">
              <div className="h-48 bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1619118884592-11b151f1ae11?auto=format&q=75&fit=crop&w=320"
                  loading="lazy"
                  alt="Photo by Fakurian Design"
                  className="h-full w-full object-cover object-center"
                />
              </div>

              <div className="flex items-center justify-between gap-2 bg-white p-3">
                <p className="text-sm text-gray-500">
                  This is some simple filler text.
                </p>

                <a
                  href="#"
                  className="inline-block shrink-0 rounded-lg border bg-white px-3 py-1 text-sm font-semibold text-indigo-500 outline-none ring-indigo-300 transition duration-100 hover:bg-gray-50 focus-visible:ring active:bg-gray-100"
                >
                  More
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
