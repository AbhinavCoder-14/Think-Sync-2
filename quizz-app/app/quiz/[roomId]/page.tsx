// 'use client';


async function Quiz({ params }: { params: { roomId: string } }) {
    const { roomId } = await params
    return (
        <><h1>This is quiz room page - {roomId}</h1></>
    )
}




export default quiz