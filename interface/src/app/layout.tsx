import { ChakraProvider } from '@chakra-ui/react'
import { EthereumProvider } from '../components/Context'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ChakraProvider>
          <EthereumProvider>
            {children}
          </EthereumProvider>
        </ChakraProvider>
      </body>
    </html>
  )
}