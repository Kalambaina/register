import { forwardRef } from "react";
import chafLogo from "@/assets/chaf-logo.png";

interface CertificateProps {
  participantName: string;
  trackingNumber: string;
  state: string;
  lga: string;
  checkedInAt: string;
  gender: string;
}

const Certificate = forwardRef<HTMLDivElement, CertificateProps>(
  ({ participantName, trackingNumber, state, lga, checkedInAt, gender }, ref) => {
    const formattedDate = new Date(checkedInAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return (
      <div
        ref={ref}
        className="relative w-[1122px] h-[794px] bg-white p-12 font-inter"
        style={{
          backgroundColor: "#ffffff",
        }}
      >
        {/* Watermark */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: 0.08 }}
        >
          <img
            src={chafLogo}
            alt="CHAF Watermark"
            className="w-[500px] h-[500px] object-contain"
          />
        </div>

        {/* Dual Border: Blue main border + Gold accent */}
        <div className="absolute inset-4">
          {/* Outer blue border */}
          <div
            className="absolute inset-0 border-[12px]"
            style={{ borderColor: "#1E3A8A" }}
          />

          {/* Inner gold accent border */}
          <div
            className="absolute inset-6 border-[4px]"
            style={{ borderColor: "#fbbf24" }}
          />

          {/* Blue corners with gold accent */}
          <div className="absolute -top-2 -left-2 w-16 h-16">
            <div
              className="w-full h-full border-t-[12px] border-l-[12px]"
              style={{ borderColor: "#1E3A8A" }}
            ></div>
            <div
              className="absolute top-1 left-1 w-14 h-14 border-t-[4px] border-l-[4px]"
              style={{ borderColor: "#fbbf24" }}
            ></div>
          </div>

          <div className="absolute -top-2 -right-2 w-16 h-16">
            <div
              className="w-full h-full border-t-[12px] border-r-[12px]"
              style={{ borderColor: "#1E3A8A" }}
            ></div>
            <div
              className="absolute top-1 right-1 w-14 h-14 border-t-[4px] border-r-[4px]"
              style={{ borderColor: "#fbbf24" }}
            ></div>
          </div>

          <div className="absolute -bottom-2 -left-2 w-16 h-16">
            <div
              className="w-full h-full border-b-[12px] border-l-[12px]"
              style={{ borderColor: "#1E3A8A" }}
            ></div>
            <div
              className="absolute bottom-1 left-1 w-14 h-14 border-b-[4px] border-l-[4px]"
              style={{ borderColor: "#fbbf24" }}
            ></div>
          </div>

          <div className="absolute -bottom-2 -right-2 w-16 h-16">
            <div
              className="w-full h-full border-b-[12px] border-r-[12px]"
              style={{ borderColor: "#1E3A8A" }}
            ></div>
            <div
              className="absolute bottom-1 right-1 w-14 h-14 border-b-[4px] border-r-[4px]"
              style={{ borderColor: "#fbbf24" }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col text-gray-800">
          {/* Header */}
          <div className="flex items-center justify-center mb-8">
            <img
              src={chafLogo}
              alt="CHAF Logo"
              className="w-24 h-24 object-contain mr-6"
            />
            <div className="text-center">
              <h1
                className="font-playfair font-bold text-4xl"
                style={{ color: "#1E3A8A" }}
              >
                CREATING HAPPINESS FOUNDATION
              </h1>
              <h2 className="font-playfair text-2xl mt-2 font-semibold text-gray-800">
                CHAF - Our Kids to the World 2025
              </h2>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h3
              className="font-script text-6xl"
              style={{ color: "#dc2626" }}
            >
              Certificate Of Participation
            </h3>
          </div>

          {/* Body */}
          <div className="text-center mb-8">
            <p className="text-xl text-gray-700 mb-6">This is to certify that</p>

            <h2 className="font-playfair text-5xl font-bold text-gray-900 mb-3">
              {participantName}
            </h2>
            <br />
            <div className="w-3/4 mx-auto border-b-2 border-gray-800 mb-6"></div>

            <p
              className="text-xl font-semibold mb-6"
              style={{ color: "#1E3A8A" }}
            >
              Has successfully attended the CHAF Our Kids TO The World Competition 2025
            </p>

            <p className="text-lg text-gray-700 italic mb-4">
              Themed: Inspiring Orphans Through Excellence
            </p>

            <div className="text-base text-gray-700 space-y-2">
              <p>
                <span
                  className="font-semibold"
                  style={{ color: "#dc2626" }}
                >
                  Organized by:
                </span>{" "}
                <span
                  className="font-semibold"
                  style={{ color: "#1E3A8A" }}
                >
                  Creating Happiness And Assistance Foundation (CHAF)
                </span>
              </p>
              <p>
                <span
                  className="font-semibold"
                  style={{ color: "#dc2626" }}
                >
                  Venue:
                </span>{" "}
                Khalifa Isyaku Rabiu University (KHAIRUN), Kano State
              </p>
              <p>
                <span
                  className="font-semibold"
                  style={{ color: "#dc2626" }}
                >
                  Date of Attendance:
                </span>{" "}
                {formattedDate}
              </p>
            </div>

            <div className="mt-6 text-sm text-gray-700 flex justify-center gap-12">
              <p>
                <span className="font-semibold">State:</span> {state}
              </p>
              <p>
                <span className="font-semibold">LGA:</span> {lga}
              </p>
              <p>
                <span className="font-semibold">Gender:</span> {gender}
              </p>
            </div>

            <p className="text-sm text-gray-600 mt-4">
              Certificate No: {trackingNumber}
            </p>

            {/* Footer */}
            <div className="mt-auto relative px-10 text-gray-800">
              <div className="flex justify-between items-end">
                {/* Chairman */}
                <div className="text-center">
                  <p className="text-sm font-semibold mb-1">Aliyu Bello</p>
                  <div className="border-t-2 border-gray-800 w-48 mb-2"></div>
                  <p className="text-sm font-semibold">
                    Chairman Organizing Committee
                  </p>
                </div>

                {/* Event Coordinator */}
                <div className="text-center">
                  <p className="text-sm font-semibold mb-1">CHAF</p>
                  <div className="border-t-2 border-gray-800 w-48 mb-2"></div>
                  <p className="text-sm font-semibold">Event Coordinator</p>
                </div>
              </div>

              {/* Centered Seal */}
              <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-12 flex items-center justify-center">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center"
                  style={{
                    background:
                      "radial-gradient(circle, #dc2626 0%, #991b1b 100%)",
                    boxShadow:
                      "0 0 0 6px #fbbf24, 0 0 0 12px #dc2626, 0 6px 24px rgba(0,0,0,0.15)",
                  }}
                >
                  <div className="text-white text-center">
                    <div className="text-xs font-bold">CHAF</div>
                    <div className="text-xs">2025</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

Certificate.displayName = "Certificate";

export default Certificate;
