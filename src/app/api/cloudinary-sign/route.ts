import cloudinary from 'cloudinary'

export const POST = (async () => {
  
  const timestamp = Math.round(new Date().getTime() / 1000)
  const signature = cloudinary.v2.utils.api_sign_request(
    {
      timestamp: timestamp,
    },
    process.env.CLOUDINARY_SECRET!
  )

  return Response.json({ signature, timestamp })
}) 
