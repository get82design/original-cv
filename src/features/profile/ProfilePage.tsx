import { AppCard } from "@/components/card/AppCard";
import { TitleAppOne } from "@/components/title/TitleAppOne";
import { TitleAppTwo } from "@/components/title/TitleAppTwo";
import { useMediaQuery } from "@utils/useWindowWidth";
import { Button } from "primereact/button";
import { SpeedDial } from "primereact/speeddial";
import { Tooltip } from "primereact/tooltip";
import { CompoPage } from "./CompoPage";
import { FormProfile } from "./form/FormProfile";
import { ProfileProvider } from "./contexte/ProfileContext";
import { trpc } from "@utils/trpc";
import { ProgressSpinner } from "primereact/progressspinner";

export const ProfilePage = () => {
	const { data: cvs, isLoading } = trpc.cv.allByUser.useQuery();
	console.log("cvs", cvs);
	const isLg = useMediaQuery("(min-width: 1024px)");
	const isMd = useMediaQuery("(min-width: 768px)");
	const isSm = useMediaQuery("(min-width: 640px)");
	const isXs = useMediaQuery("(min-width: 576px)");
	const isXl = useMediaQuery("(min-width: 1200px)");

	const items = [
		{
			label: "Add",
			icon: "pi pi-pencil",
			// command: () => {
			//     toast.current.show({ severity: 'info', summary: 'Add', detail: 'Data Added' });
			// }
		},
		{
			label: "Update",
			icon: "pi pi-refresh",
			// command: () => {
			//     toast.current.show({ severity: 'success', summary: 'Update', detail: 'Data Updated' });
			// }
		},
		{
			label: "Delete",
			icon: "pi pi-trash",
			// command: () => {
			//     toast.current.show({ severity: 'error', summary: 'Delete', detail: 'Data Deleted' });
			// }
		},
		{
			label: "Upload",
			icon: "pi pi-upload",
			// command: () => {
			//     router.push('/fileupload');
			// }
		},
		{
			label: "React Website",
			icon: "pi pi-external-link",
			// command: () => {
			//     window.location.href = 'https://react.dev/';
			// }
		},
	];

	return (
		<FormProfile>
			<div
				className={"w-full p-4 md:p-8 relative"}
				style={{ /*...ClassikAppColor(),*/ minHeight: "calc(100vh - 70px)" }}
			>
				{/* {isMd &&
                <>
                    <Tooltip target=".speeddial-bottom-right .p-speeddial-action" position="left" />
                    <SpeedDial
                        model={items}
                        radius={150}
                        type="quarter-circle"
                        className="speeddial-bottom-right right-0 bottom-0"
                        direction="down-left"
                        style={{ right: 24, top: 24 }}
                        // buttonStyle={PrimaryOutlinedButtonColorStyle()}
                    />
                </>
            } */}
				<div className="w-full flex flex-col-reverse lg:flex-row lg:justify-end gap-6">
					<div
						className="w-full hidden sm:flex flex-col gap-6"
						style={{ minHeight: "calc(100vh - 130px)" }}
					>
						<div className="w-full hidden lg:flex justify-between items-center relative">
							<TitleAppOne firstPart="DASH" secondPart="BOARD" />
							{/* <Button color="light" icon="pi pi-angle-down" iconPos='right'>Options</Button> */}
						</div>
						<ProfileProvider>
							<CompoPage cvs={cvs ?? []} /*nbCv={nbCv} cv={cv}*/ />
						</ProfileProvider>
					</div>
					<div
						style={{ height: !isLg ? "" : "calc(100vh - 130px)" }}
						className="w-full lg:w-96 flex flex-col gap-4 lg:contents"
					>
						<div className="w-full lg:hidden">
							<TitleAppOne
								firstPart="DASH"
								secondPart="BOARD"
								classNameSize="text-3xl"
							/>
						</div>
						<div
							style={{
								minHeight: !isLg ? "" : "calc(100vh - 130px)",
								width: !isLg ? "100%" : "384px",
							}}
						>
							<AppCard className={"min-h-full flex flex-col gap-4"}>
								<TitleAppTwo
									firstPart={"Vos"}
									secondPart={"CVs"}
									size={"text-2xl"}
									withSpace
								/>
								{isLoading ? (
									<ProgressSpinner
										style={{ width: "50px", height: "50px" }}
										strokeWidth="8"
										fill="var(--surface-ground)"
										animationDuration=".5s"
									/>
								) : (
									<>
										<p>
											Vous avez enregistré {cvs?.length} CV
											{cvs?.length && cvs?.length > 1 ? "s" : ""}
										</p>
										<div className="flex w-full justify-center gap-2">
											{cvs &&
												cvs.length > 0 &&
												cvs.map((cv) => {
													return (
														<div
															key={cv?.id}
															className="w-full flex flex-col items-center gap-4"
														>
															{/*<PreviewImage
                                                        width={breakpoint < 768 ? 'w-full p-2' : 'w-2/3'}
                                                        cv={cv}
                                                        action={
                                                            <>
                                                                {breakpoint >= 768 &&
                                                                    <Button size='small' onClick={() => {
                                                                        setIdCv(cv?.id as string)
                                                                        setVisibleApercu(true)
                                                                    }}>Visionner</Button>
                                                                }
                                                                {cv?.preview
                                                                    && <Button size='small' disabled={!cv?.isReadyPreview}>Télécharger</Button>
                                                                }
                                                                {breakpoint >= 768 &&
                                                                    <Link href={`/cree-ton-cv?idCv=${cv?.id}`} >
                                                                        <Button size='small'>Modifier</Button>
                                                                    </Link>
                                                                }
                                                            </>
                                                        }
                                                    /> */}
															{isSm && (
																<div className="w-full flex justify-center">
																	<Button
																		onClick={(e) => {
																			e.preventDefault();
																			// setIdCv(cv?.id as string)
																			// setVisibleSearchDatas(true)
																		}}
																	>
																		Récupérer les données du CV
																	</Button>
																</div>
															)}
														</div>
													);
												})}
										</div>
									</>
								)}
							</AppCard>
						</div>
					</div>
				</div>
			</div>
		</FormProfile>
	);
};
