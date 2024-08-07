import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <main className="flex-grow container mx-auto px-4">{children}</main>
        <footer className="bg-gray-100 text-center py-4 mt-8">
          <p className="text-gray-700">Weather app by Sofiane Ouafir</p>
        </footer>
      </body>
    </html>
  );
}
