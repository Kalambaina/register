import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Scan } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BrowserQRCodeReader } from '@zxing/browser';
import { useNavigate } from "react-router-dom";

interface QRScannerProps {
  onScan: (data: string) => void;
}

const QRScanner = ({ onScan }: QRScannerProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null);
  
  const TICKET_PREFIX = "CHAF2025";

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      return true;
    } catch (error) {
      console.error('Camera permission denied:', error);
      setHasPermission(false);
      toast({
        title: "Camera Permission Required",
        description: "Please allow camera access in your browser settings to scan QR codes.",
        variant: "destructive"
      });
      return false;
    }
  };

  const startCamera = async () => {
    try {
      // Request permission first
      const permitted = await requestCameraPermission();
      if (!permitted) {
        return;
      }

      setIsScanning(true);
      
      const codeReader = new BrowserQRCodeReader();
      codeReaderRef.current = codeReader;

      const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        throw new Error('No camera devices found on this device');
      }

      // Try to find back camera, otherwise use first available
      const selectedDeviceId = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear')
      )?.deviceId || videoInputDevices[0]?.deviceId;

      await codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current!,
        (result, error) => {
          if (result) {
            const scannedText = result.getText();
            handleScanSuccess(scannedText);
            stopCamera();
          }
        }
      );
      
      toast({
        title: "Camera Started",
        description: "Point your camera at a QR code to scan",
      });
    } catch (error) {
      console.error('Camera access error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unable to access camera';
      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive"
      });
      setIsScanning(false);
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    codeReaderRef.current = null;
    setIsScanning(false);
  };

  const handleScanSuccess = (scannedText: string) => {
    // Extract ticket number from scanned text
    // Assuming QR code contains the ticket number or a URL with the ticket number
    let ticketNumber = scannedText;
    
    // If it's a URL, extract the ticket number
    if (scannedText.includes('/ticket/')) {
      ticketNumber = scannedText.split('/ticket/')[1];
    }
    
    // Navigate to ticket validation page immediately
    navigate(`/ticket/${ticketNumber}`);
  };

  const handleManualScan = () => {
    if (manualInput.trim() && manualInput.length === 6) {
      const fullTicketNumber = TICKET_PREFIX + manualInput.trim();
      handleScanSuccess(fullTicketNumber);
      setManualInput("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setManualInput(value);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Camera Scanner */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-full max-w-md mx-auto aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
              {isScanning ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Camera not active</p>
                  </div>
                </div>
              )}
              
              {/* QR Code Overlay */}
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-white border-dashed rounded-lg">
                    <div className="w-full h-full border-4 border-primary rounded-lg animate-pulse"></div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center space-x-4">
              {!isScanning ? (
                <Button onClick={startCamera} size="lg">
                  <Camera className="w-5 h-5 mr-2" />
                  Start Camera
                </Button>
              ) : (
                <Button onClick={stopCamera} variant="outline" size="lg">
                  Stop Camera
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manual Input */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Scan className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Manual Code Entry</h3>
            </div>
            
            <p className="text-sm text-muted-foreground">
              If the camera scan doesn't work, enter the last 6 digits of the ticket number.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="manual-input">Ticket Number</Label>
              <div className="flex space-x-2">
                <div className="flex items-center px-3 py-2 bg-muted rounded-md border border-input">
                  <span className="font-mono font-semibold text-sm">{TICKET_PREFIX}</span>
                </div>
                <Input
                  id="manual-input"
                  value={manualInput}
                  onChange={handleInputChange}
                  placeholder="000000"
                  maxLength={6}
                  className="flex-1 font-mono"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                <Button 
                  onClick={handleManualScan} 
                  disabled={manualInput.length !== 6}
                >
                  Validate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the 6-digit code (e.g., if ticket is CHAF2025123456, enter 123456)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3">Scanning Instructions</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Hold the device steady and point the camera at the QR code</li>
            <li>• Ensure the QR code is well-lit and clearly visible</li>
            <li>• The QR code should fit within the scanning frame</li>
            <li>• If camera scanning fails, use manual entry with the ticket number</li>
            <li>• Valid tickets will show participant and school information</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRScanner;